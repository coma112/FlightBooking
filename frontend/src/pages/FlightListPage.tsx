import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FlightCard from '../components/flight/FlightCard';
import FlightFilters from '../components/flight/FlightFilters';
import FlightDetailsModal from '../components/flight/FlightDetailsModal';
import './FlightListPage.css';
import { FaSort } from 'react-icons/fa';
import { GrDocumentMissing } from "react-icons/gr";
import { FaArrowRight } from "react-icons/fa6";

// Mock data - később API-ból jön majd
const mockFlights = [
  {
    id: 'LH1234',
    flightNumber: 'LH1234',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T08:30:00',
    arrivalTime: '2026-03-15T10:45:00',
    aircraftType: 'Airbus A320',
    prices: {
      ECONOMY: 25900,
      BUSINESS: 89900,
      FIRST: 159900
    },
    availableSeats: {
      ECONOMY: 45,
      BUSINESS: 8,
      FIRST: 2
    },
    airline: 'Lufthansa'
  },
  {
    id: 'LH5678',
    flightNumber: 'LH5678',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T14:15:00',
    arrivalTime: '2026-03-15T16:30:00',
    aircraftType: 'Boeing 737',
    prices: {
      ECONOMY: 28500,
      BUSINESS: 95900,
      FIRST: 0
    },
    availableSeats: {
      ECONOMY: 12,
      BUSINESS: 3,
      FIRST: 0
    },
    airline: 'Lufthansa'
  },
  {
    id: 'LH9012',
    flightNumber: 'LH9012',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T19:45:00',
    arrivalTime: '2026-03-15T22:00:00',
    aircraftType: 'Airbus A321',
    prices: {
      ECONOMY: 31200,
      BUSINESS: 102900,
      FIRST: 179900
    },
    availableSeats: {
      ECONOMY: 67,
      BUSINESS: 12,
      FIRST: 4
    },
    airline: 'Lufthansa'
  },
  {
    id: 'LH3456',
    flightNumber: 'LH3456',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T06:00:00',
    arrivalTime: '2026-03-15T08:15:00',
    aircraftType: 'Airbus A319',
    prices: {
      ECONOMY: 22900,
      BUSINESS: 79900,
      FIRST: 0
    },
    availableSeats: {
      ECONOMY: 89,
      BUSINESS: 6,
      FIRST: 0
    },
    airline: 'Lufthansa'
  },
  {
    id: 'LH7890',
    flightNumber: 'LH7890',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T16:30:00',
    arrivalTime: '2026-03-15T18:45:00',
    aircraftType: 'Boeing 777',
    prices: {
      ECONOMY: 29900,
      BUSINESS: 119900,
      FIRST: 249900
    },
    availableSeats: {
      ECONOMY: 124,
      BUSINESS: 28,
      FIRST: 8
    },
    airline: 'Lufthansa'
  }
];

interface Filters {
  timeOfDay: string[];
  priceRange: [number, number];
  airlines: string[];
  minSeats: number;
}

type SortOption = 'price' | 'departure' | 'duration';

const FlightListPage = () => {
  const [flights] = useState(mockFlights);
  const [selectedFlight, setSelectedFlight] = useState<typeof mockFlights[0] | null>(null);
  const [filters, setFilters] = useState<Filters>({
    timeOfDay: [],
    priceRange: [0, 300000],
    airlines: [],
    minSeats: 0
  });
  const [sortBy, setSortBy] = useState<SortOption>('price');

  const getTimeOfDay = (time: string) => {
    const hour = new Date(time).getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    return (arr.getTime() - dep.getTime()) / (1000 * 60); 
  };

  const filteredFlights = flights.filter(flight => {
    if (filters.timeOfDay.length > 0) {
      const timeOfDay = getTimeOfDay(flight.departureTime);
      if (!filters.timeOfDay.includes(timeOfDay)) return false;
    }

    const lowestPrice = Math.min(...Object.values(flight.prices).filter(p => p > 0));
    if (lowestPrice < filters.priceRange[0] || lowestPrice > filters.priceRange[1]) {
      return false;
    }

    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
      return false;
    }

    const totalSeats = Object.values(flight.availableSeats).reduce((a, b) => a + b, 0);
    if (totalSeats < filters.minSeats) return false;

    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        const priceA = Math.min(...Object.values(a.prices).filter(p => p > 0));
        const priceB = Math.min(...Object.values(b.prices).filter(p => p > 0));
        return priceA - priceB;
      case 'departure':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      case 'duration':
        const durationA = getDuration(a.departureTime, a.arrivalTime);
        const durationB = getDuration(b.departureTime, b.arrivalTime);
        return durationA - durationB;
      default:
        return 0;
    }
  });

  return (
    <div className="flight-list-page">
      <Navbar />

      <main className="flight-list-main">
        <div className="search-header">
          <div className="search-info">
            <h1 className="route-title">
              Budapest <span className="arrow"><FaArrowRight /></span> London
            </h1>
            <p className="search-details">
              <span className="detail-item">2026. március 15.</span>
              <span className="separator">•</span>
              <span className="detail-item">1 utas</span>
              <span className="separator">•</span>
              <span className="detail-item">Economy</span>
            </p>
            <div className="results-count">
              <span className="count-number">{sortedFlights.length}</span> járat található
            </div>
          </div>
        </div>

        <div className="content-container">
          <aside className="filters-sidebar">
            <FlightFilters 
              filters={filters}
              onFilterChange={setFilters}
            />
          </aside>

          <div className="flights-content">
            <div className="sort-controls">
              <div className="sort-label">
                <FaSort />
                Rendezés:
              </div>
              <div className="sort-buttons">
                <button
                  className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                  onClick={() => setSortBy('price')}
                >
                  Legolcsóbb
                </button>
                <button
                  className={`sort-btn ${sortBy === 'departure' ? 'active' : ''}`}
                  onClick={() => setSortBy('departure')}
                >
                  Legkorábbi indulás
                </button>
                <button
                  className={`sort-btn ${sortBy === 'duration' ? 'active' : ''}`}
                  onClick={() => setSortBy('duration')}
                >
                  Legrövidebb út
                </button>
              </div>
            </div>

            <div className="flights-list">
              {sortedFlights.map(flight => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onDetailsClick={() => setSelectedFlight(flight)}
                />
              ))}

              {sortedFlights.length === 0 && (
                <div className="no-results">
                  <div className="no-results-icon"><GrDocumentMissing /></div>
                  <h3>Nincs találat</h3>
                  <p>Próbálja meg módosítani a szűrési feltételeket</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
        />
      )}
    </div>
  );
};

export default FlightListPage;