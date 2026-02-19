import { useState } from 'react';
import './FlightSearchForm.css';
import { MdFlightLand, MdFlightTakeoff, MdDateRange, MdEventSeat } from "react-icons/md";
import { IoMdPerson, IoMdSearch } from "react-icons/io";

export interface SearchParams {
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureDate: string;
  passengers: number;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

interface FlightSearchFormProps {
  onSearch?: (params: SearchParams) => void;
  loading?: boolean;
}

const AIRPORTS = [
  { code: 'BUD', name: 'Budapest Liszt Ferenc', city: 'Budapest' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Párizs' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amszterdam' },
  { code: 'BCN', name: 'Barcelona El Prat', city: 'Barcelona' },
  { code: 'FCO', name: 'Roma Fiumicino', city: 'Róma' },
  { code: 'VIE', name: 'Vienna International', city: 'Bécs' },
  { code: 'MUC', name: 'Munich Airport', city: 'München' },
  { code: 'MAD', name: 'Madrid Barajas', city: 'Madrid' },
  { code: 'WAW', name: 'Warsaw Chopin', city: 'Varsó' },
  { code: 'PRG', name: 'Prague Václav Havel', city: 'Prága' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zürich' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Koppenhága' },
  { code: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm' },
  { code: 'HEL', name: 'Helsinki Airport', city: 'Helsinki' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin' },
  { code: 'ATH', name: 'Athens International', city: 'Athén' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Isztambul' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'JFK', name: 'New York JFK', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'BKK', name: 'Bangkok Suvarnabhumi', city: 'Bangkok' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Szingapúr' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokió' },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney' },
];

const FlightSearchForm = ({ onSearch, loading = false }: FlightSearchFormProps) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState<SearchParams>({
    departureAirportCode: 'BUD',
    arrivalAirportCode: 'LHR',
    departureDate: tomorrowStr,
    passengers: 1,
    seatClass: 'ECONOMY',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'passengers' ? parseInt(value) : value,
    }));
  };

  return (
    <form className="flight-search-form" onSubmit={handleSubmit}>
      <div className="form-grid">

        <div className="form-group">
          <label htmlFor="departureAirportCode">
            <span className="icon"><MdFlightTakeoff /></span>
            Indulási repülőtér
          </label>
          <select
            id="departureAirportCode"
            name="departureAirportCode"
            value={formData.departureAirportCode}
            onChange={handleChange}
            required
          >
            <option value="">Válasszon repülőteret</option>
            {AIRPORTS.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city} ({airport.name})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="arrivalAirportCode">
            <span className="icon"><MdFlightLand /></span>
            Érkezési repülőtér
          </label>
          <select
            id="arrivalAirportCode"
            name="arrivalAirportCode"
            value={formData.arrivalAirportCode}
            onChange={handleChange}
            required
          >
            <option value="">Válasszon repülőteret</option>
            {AIRPORTS.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city} ({airport.name})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="departureDate">
            <span className="icon"><MdDateRange /></span>
            Indulás dátuma
          </label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="passengers">
            <span className="icon"><IoMdPerson /></span>
            Utasok száma: {formData.passengers}
          </label>
          <input
            type="range"
            id="passengers"
            name="passengers"
            min="1"
            max="9"
            value={formData.passengers}
            onChange={handleChange}
          />
          <div className="range-labels">
            <span>1</span>
            <span>9</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="seatClass">
            <span className="icon"><MdEventSeat /></span>
            Osztály
          </label>
          <select
            id="seatClass"
            name="seatClass"
            value={formData.seatClass}
            onChange={handleChange}
            required
          >
            <option value="ECONOMY">Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>

        <div className="form-group submit-group">
          <button type="submit" className="search-button" disabled={loading}>
            <span className="icon"><IoMdSearch /></span>
            {loading ? 'Keresés...' : 'Járatok keresése'}
          </button>
        </div>

      </div>
    </form>
  );
};

export default FlightSearchForm;