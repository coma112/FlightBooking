import './FlightCard.css';
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md';
import { FaClock, FaPlane } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';

interface Flight {
  id: string;
  flightNumber: string;
  departureAirport: { name: string; code: string; city: string };
  arrivalAirport: { name: string; code: string; city: string };
  departureTime: string;
  arrivalTime: string;
  aircraftType: string;
  prices: {
    ECONOMY: number;
    BUSINESS: number;
    FIRST: number;
  };
  availableSeats: {
    ECONOMY: number;
    BUSINESS: number;
    FIRST: number;
  };
  airline: string;
}

interface FlightCardProps {
  flight: Flight;
  onDetailsClick: () => void;
}

const FlightCard = ({ flight, onDetailsClick }: FlightCardProps) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('hu-HU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (departure: string, arrival: string) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const minutes = (arr.getTime() - dep.getTime()) / (1000 * 60);
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}ó ${mins}p`;
  };

  const getSeatStatus = (available: number): 'high' | 'medium' | 'low' => {
    if (available > 30) return 'high';
    if (available > 10) return 'medium';
    return 'low';
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('hu-HU') + ' Ft';
  };

  const handleBooking = (seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST') => {
    console.log('Booking flight:', flight.id, 'Class:', seatClass);
    alert(`Foglalás folyamatban: ${flight.flightNumber} - ${seatClass} osztály`);
  };

  return (
    <div className="flight-card">
      <div className="flight-card-header">
        <div className="flight-number">
          <FaPlane className="plane-icon" />
          {flight.flightNumber}
        </div>
        <div className="airline-name">{flight.airline}</div>
      </div>

      <div className="flight-route">
        <div className="route-point departure">
          <MdFlightTakeoff className="route-icon" />
          <div className="route-info">
            <div className="airport-code">{flight.departureAirport.code}</div>
            <div className="airport-name">{flight.departureAirport.city}</div>
            <div className="time">{formatTime(flight.departureTime)}</div>
          </div>
        </div>

        <div className="route-middle">
          <div className="duration-line">
            <div className="line"></div>
            <div className="duration-badge">
              <FaClock className="clock-icon" />
              {getDuration(flight.departureTime, flight.arrivalTime)}
            </div>
          </div>
          <div className="aircraft-type">{flight.aircraftType}</div>
        </div>

        <div className="route-point arrival">
          <MdFlightLand className="route-icon" />
          <div className="route-info">
            <div className="airport-code">{flight.arrivalAirport.code}</div>
            <div className="airport-name">{flight.arrivalAirport.city}</div>
            <div className="time">{formatTime(flight.arrivalTime)}</div>
          </div>
        </div>
      </div>

      <div className="flight-prices">
        {flight.prices.ECONOMY > 0 && (
          <div className="price-option">
            <div className="price-header">
              <span className="class-name">Economy</span>
              <span className={`seats-badge seats-${getSeatStatus(flight.availableSeats.ECONOMY)}`}>
                <IoMdPerson />
                {flight.availableSeats.ECONOMY}
              </span>
            </div>
            <div className="price-amount">{formatPrice(flight.prices.ECONOMY)}</div>
            <button 
              className="book-btn"
              onClick={() => handleBooking('ECONOMY')}
            >
              Foglalás
            </button>
          </div>
        )}

        {flight.prices.BUSINESS > 0 && (
          <div className="price-option">
            <div className="price-header">
              <span className="class-name">Business</span>
              <span className={`seats-badge seats-${getSeatStatus(flight.availableSeats.BUSINESS)}`}>
                <IoMdPerson />
                {flight.availableSeats.BUSINESS}
              </span>
            </div>
            <div className="price-amount">{formatPrice(flight.prices.BUSINESS)}</div>
            <button 
              className="book-btn"
              onClick={() => handleBooking('BUSINESS')}
            >
              Foglalás
            </button>
          </div>
        )}

        {flight.prices.FIRST > 0 && (
          <div className="price-option">
            <div className="price-header">
              <span className="class-name">First Class</span>
              <span className={`seats-badge seats-${getSeatStatus(flight.availableSeats.FIRST)}`}>
                <IoMdPerson />
                {flight.availableSeats.FIRST}
              </span>
            </div>
            <div className="price-amount">{formatPrice(flight.prices.FIRST)}</div>
            <button 
              className="book-btn"
              onClick={() => handleBooking('FIRST')}
            >
              Foglalás
            </button>
          </div>
        )}
      </div>

      <div className="flight-card-footer">
        <button className="details-btn" onClick={onDetailsClick}>
          Részletek megtekintése
        </button>
      </div>
    </div>
  );
};

export default FlightCard;