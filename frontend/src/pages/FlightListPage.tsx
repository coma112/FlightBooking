import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import FlightCard from '../components/flight/FlightCard';
import FlightFilters from '../components/flight/FlightFilters';
import FlightDetailsModal from '../components/flight/FlightDetailsModal';
import FlightSearchForm, { type SearchParams } from '../components/flight/FlightSearchForm';
import './FlightListPage.css';
import { FaSort, FaSpinner } from 'react-icons/fa';
import { GrDocumentMissing } from "react-icons/gr";
import { FaArrowRight } from "react-icons/fa6";
import { getTimeOfDay } from '../utils/flightUtils';
import { flightApi, type FlightResponse } from '../services/api';

function toCardFlight(f: FlightResponse) {
  return {
    id: String(f.id),
    flightNumber: f.flightNumber,
    departureAirport: {
      name: f.departureAirport.name,
      code: f.departureAirport.iataCode,
      city: f.departureAirport.city,
    },
    arrivalAirport: {
      name: f.arrivalAirport.name,
      code: f.arrivalAirport.iataCode,
      city: f.arrivalAirport.city,
    },
    departureTime: f.departureTime,
    arrivalTime: f.arrivalTime,
    aircraftType: 'N/A',
    prices: {
      ECONOMY: f.prices?.ECONOMY ?? 0,
      BUSINESS: f.prices?.BUSINESS ?? 0,
      FIRST: f.prices?.FIRST ?? 0,
    },
    availableSeats: {
      ECONOMY: f.availableSeats?.ECONOMY ?? 0,
      BUSINESS: f.availableSeats?.BUSINESS ?? 0,
      FIRST: f.availableSeats?.FIRST ?? 0,
    },
    airline: 'SkyBooker Airlines',
  };
}

interface Filters {
  timeOfDay: string[];
  priceRange: [number, number];
  airlines: string[];
  minSeats: number;
}

type SortOption = 'price' | 'departure' | 'duration';

interface FlightListPageProps {
  onBookingClick: (
    flight: ReturnType<typeof toCardFlight>,
    seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST'
  ) => void;
  initialSearch?: SearchParams;
}

const FlightListPage = ({ onBookingClick, initialSearch }: FlightListPageProps) => {
  const [flights, setFlights] = useState<ReturnType<typeof toCardFlight>[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<ReturnType<typeof toCardFlight> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<SearchParams | null>(initialSearch ?? null);

  const [filters, setFilters] = useState<Filters>({
    timeOfDay: [],
    priceRange: [0, 1000000],
    airlines: [],
    minSeats: 0,
  });
  const [sortBy, setSortBy] = useState<SortOption>('price');

  const didAutoSearch = useRef(false);
  useEffect(() => {
    if (initialSearch && !didAutoSearch.current) {
      didAutoSearch.current = true;
      handleSearch(initialSearch);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentSearch(params);

    try {
      const results = await flightApi.searchFlights({
        departureAirportCode: params.departureAirportCode,
        arrivalAirportCode: params.arrivalAirportCode,
        departureDate: params.departureDate,
        passengers: params.passengers,
        seatClass: params.seatClass,
      });
      setFlights(results.map(toCardFlight));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Hiba történt a keresés során';
      setError(msg);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (departure: string, arrival: string) => {
    return (new Date(arrival).getTime() - new Date(departure).getTime()) / (1000 * 60);
  };

  const filteredFlights = flights.filter(flight => {
    if (filters.timeOfDay.length > 0) {
      const tod = getTimeOfDay(flight.departureTime);
      if (!filters.timeOfDay.includes(tod)) return false;
    }
    const lowestPrice = Math.min(
      ...Object.values(flight.prices).filter(p => p > 0)
    );
    if (lowestPrice < filters.priceRange[0] || lowestPrice > filters.priceRange[1]) return false;
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) return false;
    const totalSeats = Object.values(flight.availableSeats).reduce((a, b) => a + b, 0);
    if (totalSeats < filters.minSeats) return false;
    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'price') {
      return (
        Math.min(...Object.values(a.prices).filter(p => p > 0)) -
        Math.min(...Object.values(b.prices).filter(p => p > 0))
      );
    }
    if (sortBy === 'departure') {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    }
    if (sortBy === 'duration') {
      return getDuration(a.departureTime, a.arrivalTime) - getDuration(b.departureTime, b.arrivalTime);
    }
    return 0;
  });

  const depCity = currentSearch ? currentSearch.departureAirportCode : 'Indulás';
  const arrCity = currentSearch ? currentSearch.arrivalAirportCode : 'Érkezés';

  return (
    <div className="flight-list-page">
      <Navbar />

      <main className="flight-list-main">
        <div className="search-header">
          <div className="search-info" style={{ marginBottom: '1.5rem' }}>
            <h1 className="route-title">
              {depCity} <span className="arrow"><FaArrowRight /></span> {arrCity}
            </h1>
            {currentSearch && (
              <p className="search-details">
                <span className="detail-item">{currentSearch.departureDate}</span>
                <span className="separator">•</span>
                <span className="detail-item">{currentSearch.passengers} utas</span>
                <span className="separator">•</span>
                <span className="detail-item">{currentSearch.seatClass}</span>
              </p>
            )}
            {hasSearched && !loading && (
              <div className="results-count">
                <span className="count-number">{sortedFlights.length}</span> járat található
              </div>
            )}
          </div>

          <FlightSearchForm
            onSearch={handleSearch}
            loading={loading}
            initialValues={currentSearch ?? undefined}
          />
        </div>

        <div className="content-container">
          <aside className="filters-sidebar">
            <FlightFilters filters={filters} onFilterChange={setFilters} />
          </aside>

          <div className="flights-content">
            {sortedFlights.length > 0 && (
              <div className="sort-controls">
                <div className="sort-label">
                  <FaSort /> Rendezés:
                </div>
                <div className="sort-buttons">
                  {(['price', 'departure', 'duration'] as SortOption[]).map(opt => (
                    <button
                      key={opt}
                      className={`sort-btn ${sortBy === opt ? 'active' : ''}`}
                      onClick={() => setSortBy(opt)}
                    >
                      {opt === 'price' ? 'Legolcsóbb' : opt === 'departure' ? 'Legkorábbi indulás' : 'Legrövidebb út'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="no-results">
                <div style={{ fontSize: '3rem', color: '#2c5282', marginBottom: '1rem' }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <h3>Járatok keresése...</h3>
                <p>Kérjük, várjon egy pillanatot</p>
              </div>
            )}

            {error && !loading && (
              <div className="no-results">
                <div className="no-results-icon">⚠️</div>
                <h3>Hiba történt</h3>
                <p>{error}</p>
              </div>
            )}

            {!hasSearched && !loading && (
              <div className="no-results">
                <div className="no-results-icon">✈️</div>
                <h3>Keressen járatot</h3>
                <p>Adja meg az indulási és érkezési repteret, majd kattintson a keresés gombra</p>
              </div>
            )}

            {!loading && !error && hasSearched && (
              <div className="flights-list">
                {sortedFlights.map(flight => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onDetailsClick={() => setSelectedFlight(flight)}
                    onBookingClick={onBookingClick}
                  />
                ))}
                {sortedFlights.length === 0 && (
                  <div className="no-results">
                    <div className="no-results-icon"><GrDocumentMissing /></div>
                    <h3>Nincs találat</h3>
                    <p>Próbálja meg módosítani a keresési feltételeket vagy a szűrőket</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          onClose={() => setSelectedFlight(null)}
          onBookingClick={onBookingClick}
        />
      )}
    </div>
  );
};

export default FlightListPage;