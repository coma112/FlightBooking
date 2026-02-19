import psycopg2
import random
import string
from datetime import datetime, timedelta, date
from faker import Faker

fake = Faker('hu_HU')

DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'flightbooking',
    'user': 'postgres',
    'password': 'coma112'
}

AIRCRAFT_TYPES = [
    ('AIRBUS_A319_100', 120, 90, 24, 6),
    ('AIRBUS_A320_200', 150, 120, 24, 6),
    ('AIRBUS_A320NEO', 165, 132, 27, 6),
    ('AIRBUS_A321_200', 200, 162, 30, 8),
    ('AIRBUS_A321_NEO', 220, 180, 32, 8),
    ('AIRBUS_A330_300', 300, 220, 56, 24),
    ('AIRBUS_A350_900', 350, 256, 70, 24),
    ('AIRBUS_A380_800', 555, 420, 98, 37),
    ('BOEING_747_400', 416, 304, 86, 26),
    ('BOEING_747_8I', 467, 364, 86, 17),
    ('BOEING_777_9', 426, 320, 80, 26),
    ('BOEING_787_9', 296, 224, 56, 16),
]

AIRPORTS = [
    ('BUD', 'Budapest Ferenc Liszt International Airport', 'Budapest', 'Hungary'),
    ('LHR', 'London Heathrow Airport', 'London', 'United Kingdom'),
    ('CDG', 'Paris Charles de Gaulle Airport', 'Paris', 'France'),
    ('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany'),
    ('AMS', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands'),
    ('BCN', 'Barcelona El Prat Airport', 'Barcelona', 'Spain'),
    ('FCO', 'Rome Fiumicino Airport', 'Rome', 'Italy'),
    ('VIE', 'Vienna International Airport', 'Vienna', 'Austria'),
    ('MUC', 'Munich Airport', 'Munich', 'Germany'),
    ('MAD', 'Adolfo Suárez Madrid–Barajas Airport', 'Madrid', 'Spain'),
    ('WAW', 'Warsaw Chopin Airport', 'Warsaw', 'Poland'),
    ('PRG', 'Václav Havel Airport Prague', 'Prague', 'Czech Republic'),
    ('ZRH', 'Zurich Airport', 'Zurich', 'Switzerland'),
    ('CPH', 'Copenhagen Airport', 'Copenhagen', 'Denmark'),
    ('ARN', 'Stockholm Arlanda Airport', 'Stockholm', 'Sweden'),
    ('HEL', 'Helsinki Airport', 'Helsinki', 'Finland'),
    ('OSL', 'Oslo Gardermoen Airport', 'Oslo', 'Norway'),
    ('DUB', 'Dublin Airport', 'Dublin', 'Ireland'),
    ('ATH', 'Athens International Airport', 'Athens', 'Greece'),
    ('IST', 'Istanbul Airport', 'Istanbul', 'Turkey'),
    ('DXB', 'Dubai International Airport', 'Dubai', 'UAE'),
    ('JFK', 'John F. Kennedy International Airport', 'New York', 'USA'),
    ('LAX', 'Los Angeles International Airport', 'Los Angeles', 'USA'),
    ('ORD', "O'Hare International Airport", 'Chicago', 'USA'),
    ('BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand'),
    ('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore'),
    ('HKG', 'Hong Kong International Airport', 'Hong Kong', 'China'),
    ('NRT', 'Narita International Airport', 'Tokyo', 'Japan'),
    ('SYD', 'Sydney Airport', 'Sydney', 'Australia'),
    ('GRU', 'São Paulo/Guarulhos International Airport', 'São Paulo', 'Brazil'),
]

AIRLINES = ['Lufthansa', 'Austrian Airlines', 'Swiss', 'Ryanair', 'Wizz Air', 'British Airways', 'Air France', 'KLM']

FLIGHT_PREFIXES = {
    'Lufthansa': 'LH',
    'Austrian Airlines': 'OS',
    'Swiss': 'LX',
    'Ryanair': 'FR',
    'Wizz Air': 'W6',
    'British Airways': 'BA',
    'Air France': 'AF',
    'KLM': 'KL'
}

BASE_PRICES = {
    'short': (15000, 35000),
    'medium': (30000, 80000),
    'long': (70000, 250000)
}

FLIGHT_STATUS_WEIGHTS = [
    ('SCHEDULED', 60),
    ('BOARDING', 5),
    ('DEPARTED', 10),
    ('ARRIVED', 15),
    ('CANCELLED', 5),
    ('DELAYED', 5)
]

BOOKING_STATUS_WEIGHTS = [
    ('PENDING', 30),
    ('CONFIRMED', 55),
    ('CANCELLED', 15)
]

def weighted_choice(choices):
    items, weights = zip(*choices)
    return random.choices(items, weights=weights, k=1)[0]

def generate_booking_reference():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def generate_reg_number():
    letters = ''.join(random.choices(string.ascii_uppercase, k=random.choice([1, 2])))
    tail = ''.join(random.choices(string.ascii_uppercase, k=4))
    return f"{letters}-{tail}"

def estimate_flight_hours(dep_code, arr_code):
    long_haul = {'DXB', 'JFK', 'LAX', 'ORD', 'BKK', 'SIN', 'HKG', 'NRT', 'SYD', 'GRU'}
    if dep_code in long_haul or arr_code in long_haul:
        return random.uniform(8, 14)
    medium_haul = {'IST', 'ATH', 'MAD', 'BCN', 'FCO', 'CDG', 'LHR', 'AMS', 'FRA', 'ZRH', 'CPH', 'ARN', 'HEL', 'OSL', 'DUB'}
    if dep_code in medium_haul or arr_code in medium_haul:
        return random.uniform(2, 5)
    return random.uniform(1, 3)

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        print("Táblák tisztítása...")
        cur.execute("""
            TRUNCATE TABLE bookings, seats, flights, passengers, aircraft, airports
            RESTART IDENTITY CASCADE
        """)
        print("  Kész\n")

        print("Aircraft generálása...")
        used_reg = set()
        aircraft_ids = []

        for model, total, eco, biz, first in AIRCRAFT_TYPES:
            for _ in range(random.randint(3, 8)):
                while True:
                    reg = generate_reg_number()
                    if reg not in used_reg:
                        used_reg.add(reg)
                        break
                cur.execute("""
                    INSERT INTO aircraft (model, registration_number, total_seats, economy_seats, business_seats, first_seats)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (model, reg, total, eco, biz, first))
                aircraft_ids.append(cur.fetchone()[0])

        print(f"  {len(aircraft_ids)} aircraft kész")

        print("Repterek generálása...")
        airport_id_map = {}

        for iata, name, city, country in AIRPORTS:
            cur.execute("""
                INSERT INTO airports (iata_code, name, city, country)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (iata_code) DO NOTHING
                RETURNING id
            """, (iata, name, city, country))
            row = cur.fetchone()
            if row:
                airport_id_map[iata] = row[0]

        cur.execute("SELECT iata_code, id FROM airports")
        for iata, aid in cur.fetchall():
            airport_id_map[iata] = aid

        print(f"  {len(airport_id_map)} reptér kész")

        # FIX: minden sor bent van a cikluson belül
        print("Járatok generálása...")
        flight_ids = []
        used_flight_numbers = set()
        airport_codes = list(airport_id_map.keys())
        base_date = datetime.now() - timedelta(days=10)

        for _ in range(500):                                        
            dep_code = random.choice(airport_codes)
            arr_code = random.choice([c for c in airport_codes if c != dep_code])

            airline = random.choice(AIRLINES)
            prefix = FLIGHT_PREFIXES[airline]

            while True:
                num = random.randint(100, 9999)
                fn = f"{prefix}{num}"
                if fn not in used_flight_numbers:
                    used_flight_numbers.add(fn)
                    break

            hours = estimate_flight_hours(dep_code, arr_code) 
            dep_offset_days = random.randint(-5, 90)
            dep_hour = random.randint(5, 23)
            dep_minute = random.choice([0, 15, 30, 45])
            dep_time = (
                base_date.replace(hour=dep_hour, minute=dep_minute, second=0, microsecond=0)
                + timedelta(days=dep_offset_days)
            )
            arr_time = dep_time + timedelta(hours=hours)

            if hours < 2:
                price_range = BASE_PRICES['short']
            elif hours < 6:
                price_range = BASE_PRICES['medium']
            else:
                price_range = BASE_PRICES['long']

            base_price = random.randint(*price_range)
            status = weighted_choice(FLIGHT_STATUS_WEIGHTS)

            if dep_time < datetime.now() and status == 'SCHEDULED':
                status = 'ARRIVED'

            aircraft_id = random.choice(aircraft_ids)

            cur.execute("""
                INSERT INTO flights (flight_number, departure_airport_id, arrival_airport_id, aircraft_id,
                                     departure_time, arrival_time, base_price, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (fn, airport_id_map[dep_code], airport_id_map[arr_code], aircraft_id,
                  dep_time, arr_time, base_price, status))
            flight_ids.append((cur.fetchone()[0], aircraft_id, dep_time))  # <-- BENT

        print(f"  {len(flight_ids)} járat kész")

        print("Ülések generálása...")
        seat_count = 0

        cur.execute("SELECT id, economy_seats, business_seats, first_seats FROM aircraft")
        aircraft_config = {row[0]: {'eco': row[1], 'biz': row[2], 'first': row[3]} for row in cur.fetchall()}

        cur.execute("SELECT id, base_price FROM flights")
        flight_base_prices = {row[0]: float(row[1]) for row in cur.fetchall()}

        for flight_id, aircraft_id, dep_time in flight_ids:
            base_price = flight_base_prices.get(flight_id, 30000)
            config = aircraft_config.get(aircraft_id)
            if not config:
                continue

            # Economy: sorok 10-től, 6 szék/sor (A-F)
            for i in range(1, config['eco'] + 1):
                row_num = ((i - 1) // 6) + 10
                col = chr(65 + ((i - 1) % 6))
                seat_num = f"{row_num}{col}"
                available = random.random() > 0.3
                price = base_price * random.uniform(0.85, 1.15)
                cur.execute("""
                    INSERT INTO seats (flight_id, seat_number, seat_class, is_available, price)
                    VALUES (%s, %s, 'ECONOMY', %s, %s)
                """, (flight_id, seat_num, available, round(price, 2)))
                seat_count += 1

            # Business: sorok 4-től, 4 szék/sor (A-D)
            for i in range(1, config['biz'] + 1):
                row_num = ((i - 1) // 4) + 4
                col = chr(65 + ((i - 1) % 4))
                seat_num = f"{row_num}{col}"
                available = random.random() > 0.4
                price = base_price * 2.5 * random.uniform(0.9, 1.1)
                cur.execute("""
                    INSERT INTO seats (flight_id, seat_number, seat_class, is_available, price)
                    VALUES (%s, %s, 'BUSINESS', %s, %s)
                """, (flight_id, seat_num, available, round(price, 2)))
                seat_count += 1

            # First: sorok 1-től, 4 szék/sor (A-D)
            for i in range(1, config['first'] + 1):
                row_num = ((i - 1) // 4) + 1
                col = chr(65 + ((i - 1) % 4))
                seat_num = f"{row_num}{col}"
                available = random.random() > 0.5
                price = base_price * 4.0 * random.uniform(0.9, 1.1)
                cur.execute("""
                    INSERT INTO seats (flight_id, seat_number, seat_class, is_available, price)
                    VALUES (%s, %s, 'FIRST', %s, %s)
                """, (flight_id, seat_num, available, round(price, 2)))
                seat_count += 1

        print(f"  {seat_count} ülés kész")

        print("Utasok generálása...")
        passenger_ids = []

        for _ in range(300):
            first = fake.first_name()
            last = fake.last_name()
            email = f"{first.lower()}.{last.lower()}{random.randint(1, 999)}@gmail.com"
            phone = f"+36{random.choice([20, 30, 70])}{random.randint(1000000, 9999999)}"
            letters = ''.join(random.choices(string.ascii_uppercase, k=2))
            digits = ''.join(random.choices(string.digits, k=7))
            passport = f"{letters}{digits}"
            birth_year = random.randint(1950, 2003)
            birth_month = random.randint(1, 12)
            birth_day = random.randint(1, 28)
            dob = date(birth_year, birth_month, birth_day)

            cur.execute("""
                INSERT INTO passengers (first_name, last_name, email, phone_number, passport_number, date_of_birth)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (first, last, email, phone, passport, dob))
            passenger_ids.append(cur.fetchone()[0])

        print(f"  {len(passenger_ids)} utas kész")

        print("Foglalások generálása...")
        booking_count = 0
        used_refs = set()

        # LEFT JOIN kizárja azokat a székeket, amikre már van booking
        cur.execute("""
            SELECT s.id, s.flight_id, s.seat_class, s.price
            FROM seats s
            LEFT JOIN bookings b ON b.seat_id = s.id
            WHERE s.is_available = true
              AND b.id IS NULL
            LIMIT 5000
        """)
        unique_seats = cur.fetchall()
        seats_to_book = random.sample(unique_seats, min(400, len(unique_seats)))

        for seat_id, flight_id, _, seat_price in seats_to_book:
            passenger_id = random.choice(passenger_ids)
            status = weighted_choice(BOOKING_STATUS_WEIGHTS)

            while True:
                ref = generate_booking_reference()
                if ref not in used_refs:
                    used_refs.add(ref)
                    break

            booking_date = datetime.now() - timedelta(days=random.randint(0, 60))

            cur.execute("""
                INSERT INTO bookings (booking_reference, flight_id, passenger_id, seat_id,
                                      booking_date, total_price, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (ref, flight_id, passenger_id, seat_id, booking_date, seat_price, status))

            if status != 'CANCELLED':
                cur.execute("UPDATE seats SET is_available = false WHERE id = %s", (seat_id,))

            booking_count += 1

        print(f"  {booking_count} foglalás kész")

        conn.commit()
        print("\nMinden sikeresen legenerálva!")

    except Exception as e:
        conn.rollback()
        print(f"Hiba: {e}")
        raise
    finally:
        cur.close()
        conn.close()


main()