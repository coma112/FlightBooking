import { useState } from 'react';
import './FlightSearchForm.css';
import { MdFlightLand, MdFlightTakeoff, MdDateRange, MdEventSeat } from "react-icons/md";
import { IoMdPerson, IoMdSearch } from "react-icons/io";

interface FlightSearchFormProps {
  onSearch?: () => void;
}

const FlightSearchForm = ({ onSearch }: FlightSearchFormProps) => {
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    passengers: 1,
    seatClass: 'ECONOMY'
  });

  const airports = [
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
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Keresési adatok:', formData);
    
    if (onSearch) {
      onSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'passengers' ? parseInt(value) : value
    }));
  };

  return (
    <form className="flight-search-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="departureAirport">
            <span className="icon"><MdFlightTakeoff /></span>
            Indulási repülőtér
          </label>
          <select
            id="departureAirport"
            name="departureAirport"
            value={formData.departureAirport}
            onChange={handleChange}
            required
          >
            <option value="">Válasszon repülőteret</option>
            {airports.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.code} - {airport.city} ({airport.name})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="arrivalAirport">
            <span className="icon"><MdFlightLand /></span>
            Érkezési repülőtér
          </label>
          <select
            id="arrivalAirport"
            name="arrivalAirport"
            value={formData.arrivalAirport}
            onChange={handleChange}
            required
          >
            <option value="">Válasszon repülőteret</option>
            {airports.map(airport => (
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
          <button type="submit" className="search-button">
            <span className="icon"><IoMdSearch /></span>
            Járatok keresése
          </button>
        </div>
      </div>
    </form>
  );
};

export default FlightSearchForm;