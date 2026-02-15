import { useState } from 'react';
import './FlightFilters.css';
import { MdLightMode, MdNightsStay } from 'react-icons/md';
import { FaSun } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';

interface Filters {
  timeOfDay: string[];
  priceRange: [number, number];
  airlines: string[];
  minSeats: number;
}

interface FlightFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const FlightFilters = ({ filters, onFilterChange }: FlightFiltersProps) => {
  const [priceMin, setPriceMin] = useState(filters.priceRange[0]);
  const [priceMax, setPriceMax] = useState(filters.priceRange[1]);

  const timeSlots = [
    { id: 'morning', label: 'Reggel', icon: <MdLightMode />, time: '05:00 - 12:00' },
    { id: 'afternoon', label: 'Délután', icon: <FaSun />, time: '12:00 - 18:00' },
    { id: 'evening', label: 'Este', icon: <MdNightsStay />, time: '18:00 - 23:59' }
  ];

  const airlines = ['Lufthansa', 'Austrian Airlines', 'Swiss'];

  const toggleTimeSlot = (slot: string) => {
    const newTimes = filters.timeOfDay.includes(slot)
      ? filters.timeOfDay.filter(t => t !== slot)
      : [...filters.timeOfDay, slot];
    
    onFilterChange({ ...filters, timeOfDay: newTimes });
  };

  const toggleAirline = (airline: string) => {
    const newAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
    
    onFilterChange({ ...filters, airlines: newAirlines });
  };

  const handlePriceChange = () => {
    onFilterChange({ 
      ...filters, 
      priceRange: [priceMin, priceMax] 
    });
  };

  const handleMinSeatsChange = (value: number) => {
    onFilterChange({ ...filters, minSeats: value });
  };

  const resetFilters = () => {
    setPriceMin(0);
    setPriceMax(300000);
    onFilterChange({
      timeOfDay: [],
      priceRange: [0, 300000],
      airlines: [],
      minSeats: 0
    });
  };

  return (
    <div className="flight-filters">
      <div className="filters-header">
        <h3 className="filters-title">Szűrők</h3>
        <button className="reset-btn" onClick={resetFilters}>
          Törlés
        </button>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">Indulási idő</h4>
        <div className="time-slots">
          {timeSlots.map(slot => (
            <button
              key={slot.id}
              className={`time-slot ${filters.timeOfDay.includes(slot.id) ? 'active' : ''}`}
              onClick={() => toggleTimeSlot(slot.id)}
            >
              <span className="slot-icon">{slot.icon}</span>
              <div className="slot-info">
                <div className="slot-label">{slot.label}</div>
                <div className="slot-time">{slot.time}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">Ár tartomány</h4>
        <div className="price-inputs">
          <div className="price-input-group">
            <label>Min</label>
            <input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              onBlur={handlePriceChange}
              min="0"
              max={priceMax}
              step="1000"
            />
            <span className="currency">Ft</span>
          </div>
          <div className="separator">-</div>
          <div className="price-input-group">
            <label>Max</label>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              onBlur={handlePriceChange}
              min={priceMin}
              max="500000"
              step="1000"
            />
            <span className="currency">Ft</span>
          </div>
        </div>
        <div className="price-range">
          <input
            type="range"
            min="0"
            max="300000"
            value={priceMin}
            onChange={(e) => setPriceMin(Number(e.target.value))}
            onMouseUp={handlePriceChange}
            onTouchEnd={handlePriceChange}
            className="range-min"
          />
          <input
            type="range"
            min="0"
            max="300000"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            onMouseUp={handlePriceChange}
            onTouchEnd={handlePriceChange}
            className="range-max"
          />
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">Légitársaság</h4>
        <div className="airline-options">
          {airlines.map(airline => (
            <label key={airline} className="airline-checkbox">
              <input
                type="checkbox"
                checked={filters.airlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
              />
              <span className="checkbox-custom"></span>
              <span className="airline-name">{airline}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className="filter-label">
          <IoMdPerson className="label-icon" />
          Min. szabad helyek: {filters.minSeats}
        </h4>
        <div className="seats-buttons">
          {[0, 10, 20, 50].map(value => (
            <button
              key={value}
              className={`seats-btn ${filters.minSeats === value ? 'active' : ''}`}
              onClick={() => handleMinSeatsChange(value)}
            >
              {value === 0 ? 'Bármennyi' : `${value}+`}
            </button>
          ))}
        </div>
      </div>

      {(filters.timeOfDay.length > 0 || 
        filters.airlines.length > 0 || 
        filters.minSeats > 0 || 
        priceMin > 0 || 
        priceMax < 300000) && (
        <div className="active-filters">
          <div className="active-count">
            {filters.timeOfDay.length + filters.airlines.length + 
             (filters.minSeats > 0 ? 1 : 0) + 
             (priceMin > 0 || priceMax < 300000 ? 1 : 0)} aktív szűrő
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightFilters;