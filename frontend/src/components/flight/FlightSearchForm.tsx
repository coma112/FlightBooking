import { useState, useEffect } from 'react';
import './FlightSearchForm.css';
import { MdFlightLand, MdFlightTakeoff, MdDateRange, MdEventSeat } from "react-icons/md";
import { IoMdPerson, IoMdSearch } from "react-icons/io";
import { flightApi } from '../../services/api';
import CustomSelect from '../common/CustomSelect';
import type { SelectOption } from '../common/CustomSelect';

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
  initialValues?: SearchParams;
}

const AIRPORT_OPTIONS: SelectOption[] = [
  { value: 'BUD', label: 'Budapest', sublabel: 'Liszt Ferenc', icon: '🇭🇺' },
  { value: 'LHR', label: 'London', sublabel: 'Heathrow', icon: '🇬🇧' },
  { value: 'CDG', label: 'Párizs', sublabel: 'Charles de Gaulle', icon: '🇫🇷' },
  { value: 'FRA', label: 'Frankfurt', sublabel: 'Frankfurt Airport', icon: '🇩🇪' },
  { value: 'AMS', label: 'Amszterdam', sublabel: 'Schiphol', icon: '🇳🇱' },
  { value: 'BCN', label: 'Barcelona', sublabel: 'El Prat', icon: '🇪🇸' },
  { value: 'FCO', label: 'Róma', sublabel: 'Fiumicino', icon: '🇮🇹' },
  { value: 'VIE', label: 'Bécs', sublabel: 'Vienna International', icon: '🇦🇹' },
  { value: 'MUC', label: 'München', sublabel: 'Munich Airport', icon: '🇩🇪' },
  { value: 'MAD', label: 'Madrid', sublabel: 'Barajas', icon: '🇪🇸' },
  { value: 'WAW', label: 'Varsó', sublabel: 'Chopin', icon: '🇵🇱' },
  { value: 'PRG', label: 'Prága', sublabel: 'Václav Havel', icon: '🇨🇿' },
  { value: 'ZRH', label: 'Zürich', sublabel: 'Zurich Airport', icon: '🇨🇭' },
  { value: 'CPH', label: 'Koppenhága', sublabel: 'Copenhagen Airport', icon: '🇩🇰' },
  { value: 'ARN', label: 'Stockholm', sublabel: 'Arlanda', icon: '🇸🇪' },
  { value: 'HEL', label: 'Helsinki', sublabel: 'Helsinki Airport', icon: '🇫🇮' },
  { value: 'DUB', label: 'Dublin', sublabel: 'Dublin Airport', icon: '🇮🇪' },
  { value: 'ATH', label: 'Athén', sublabel: 'Athens International', icon: '🇬🇷' },
  { value: 'IST', label: 'Isztambul', sublabel: 'Istanbul Airport', icon: '🇹🇷' },
  { value: 'DXB', label: 'Dubai', sublabel: 'Dubai International', icon: '🇦🇪' },
  { value: 'JFK', label: 'New York', sublabel: 'John F. Kennedy', icon: '🇺🇸' },
  { value: 'LAX', label: 'Los Angeles', sublabel: 'LAX International', icon: '🇺🇸' },
  { value: 'BKK', label: 'Bangkok', sublabel: 'Suvarnabhumi', icon: '🇹🇭' },
  { value: 'SIN', label: 'Szingapúr', sublabel: 'Changi', icon: '🇸🇬' },
  { value: 'NRT', label: 'Tokió', sublabel: 'Narita', icon: '🇯🇵' },
  { value: 'SYD', label: 'Sydney', sublabel: 'Sydney Airport', icon: '🇦🇺' },
];

const CLASS_OPTIONS: SelectOption[] = [
  { value: 'ECONOMY', label: 'Economy', icon: '💺', description: 'Gazdaságos utazás' },
  { value: 'BUSINESS', label: 'Business', icon: '🛋️', description: 'Kényelmes üzleti osztály' },
  { value: 'FIRST', label: 'First Class', icon: '✨', description: 'Prémium első osztály' },
];

const FALLBACK: SearchParams = {
  departureAirportCode: 'BUD',
  arrivalAirportCode: 'LHR',
  departureDate: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })(),
  passengers: 1,
  seatClass: 'ECONOMY',
};

const FlightSearchForm = ({ onSearch, loading = false, initialValues }: FlightSearchFormProps) => {
  const [formData, setFormData] = useState<SearchParams>(initialValues ?? FALLBACK);
  const [prefilling, setPrefilling] = useState(!initialValues);

  useEffect(() => {
    if (initialValues) return;

    const fetchFirstFlight = async () => {
      try {
        for (let id = 1; id <= 20; id++) {
          try {
            const flight = await flightApi.getFlightById(id);
            const depDate = flight.departureTime.split('T')[0];
            const today = new Date().toISOString().split('T')[0];

            if (depDate >= today) {
              setFormData({
                departureAirportCode: flight.departureAirport.iataCode,
                arrivalAirportCode: flight.arrivalAirport.iataCode,
                departureDate: depDate,
                passengers: 1,
                seatClass: 'ECONOMY',
              });
              break;
            }
          } catch {
          }
        }
      } finally {
        setPrefilling(false);
      }
    };

    fetchFirstFlight();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(formData);
  };

  const handlePassengers = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }));
  };

  const handleDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, departureDate: e.target.value }));
  };

  return (
    <form className="flight-search-form" onSubmit={handleSubmit}>
      <div className="form-grid">

        <div className="form-group">
          <label htmlFor="departureAirportCode">
            <span className="icon"><MdFlightTakeoff /></span>
            Indulási repülőtér
          </label>
          <CustomSelect 
            options={AIRPORT_OPTIONS}
            value={formData.departureAirportCode}
            onChange={val => setFormData(prev => ({ ...prev, departureAirportCode: val }))}
            placeholder="Válasszon repülőteret"
            searchable
            disabled={prefilling}
          />
        </div>

        <div className="form-group">
          <label htmlFor="arrivalAirportCode">
            <span className="icon"><MdFlightLand /></span>
            Érkezési repülőtér
          </label>
          <CustomSelect 
            options={AIRPORT_OPTIONS}
            value={formData.arrivalAirportCode}
            onChange={val => setFormData(prev => ({ ...prev, arrivalAirportCode: val }))}
            placeholder="Válasszon repülőteret"
            searchable
            disabled={prefilling}
          />
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
            onChange={handleDate}
            min={new Date().toISOString().split('T')[0]}
            disabled={prefilling}
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
            onChange={handlePassengers}
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
          <CustomSelect 
            options={CLASS_OPTIONS}
            value={formData.seatClass}
            onChange={val => setFormData(prev => ({ ...prev, seatClass: val as SearchParams['seatClass'] }))}
          />
        </div>

        <div className="form-group submit-group">
          <button type="submit" className="search-button" disabled={loading || prefilling}>
            <span className="icon"><IoMdSearch /></span>
            {prefilling ? 'Betöltés...' : loading ? 'Keresés...' : 'Járatok keresése'}
          </button>
        </div>

      </div>
    </form>
  );
};

export default FlightSearchForm;