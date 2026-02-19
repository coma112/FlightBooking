import { useEffect } from 'react';
import './FlightDetailsModal.css';
import { MdClose, MdFlightTakeoff, MdFlightLand, MdEventSeat } from 'react-icons/md';
import { FaPlane, FaClock, FaLuggageCart, FaShoppingBag } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { GiWeight } from "react-icons/gi";
import { formatTime, formatDate } from '../../utils/dateUtils';
import { getDuration, formatPriceSimple, getSeatStatusLabel } from '../../utils/flightUtils';

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

interface FlightDetailsModalProps {
  flight: Flight;
  onClose: () => void;
  onBookingClick?: (flight: Flight, seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST') => void;
}

const FlightDetailsModal = ({ flight, onClose, onBookingClick }: FlightDetailsModalProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const flightDetails = {
    terminal: {
      departure: 'Terminal 2B',
      arrival: 'Terminal 5'
    },
    gate: {
      departure: '23',
      arrival: '12'
    },
    baggage: {
      checkedBags: 1,
      cabinBag: 1,
      weight: '23kg'
    },
    services: [
      'Ingyenes Wi-Fi',
      'Szórakoztatás fedélzeten',
      'Étkezés (Business & First)',
      'USB töltés',
      'Extra lábtér (Business & First)'
    ]
  };

  const handleBooking = (seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST') => {
    if (onBookingClick) {
      onClose();
      onBookingClick(flight, seatClass);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <MdClose />
        </button>

        <div className="modal-header">
          <div className="modal-flight-number">
            <FaPlane className="plane-icon" />
            {flight.flightNumber}
          </div>
          <div className="modal-airline">{flight.airline}</div>
        </div>

        <div className="modal-body">
          <section className="details-section">
            <h3 className="section-title">Járat információk</h3>
            
            <div className="route-timeline">
              <div className="timeline-point departure">
                <div className="point-icon">
                  <MdFlightTakeoff />
                </div>
                <div className="point-details">
                  <div className="point-time">{formatTime(flight.departureTime)}</div>
                  <div className="point-date">{formatDate(flight.departureTime)}</div>
                  <div className="point-location">
                    <span className="location-code">{flight.departureAirport.code}</span>
                    <span className="location-name">{flight.departureAirport.name}</span>
                  </div>
                  <div className="point-extra">
                    {flightDetails.terminal.departure} • Kapu {flightDetails.gate.departure}
                  </div>
                </div>
              </div>

              <div className="timeline-middle">
                <div className="timeline-line"></div>
                <div className="timeline-duration">
                  <FaClock />
                  <span>{getDuration(flight.departureTime, flight.arrivalTime)}</span>
                </div>
                <div className="timeline-aircraft">
                  <FaPlane />
                  <span>{flight.aircraftType}</span>
                </div>
              </div>

              <div className="timeline-point arrival">
                <div className="point-icon">
                  <MdFlightLand />
                </div>
                <div className="point-details">
                  <div className="point-time">{formatTime(flight.arrivalTime)}</div>
                  <div className="point-date">{formatDate(flight.arrivalTime)}</div>
                  <div className="point-location">
                    <span className="location-code">{flight.arrivalAirport.code}</span>
                    <span className="location-name">{flight.arrivalAirport.name}</span>
                  </div>
                  <div className="point-extra">
                    {flightDetails.terminal.arrival} • Kapu {flightDetails.gate.arrival}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="details-section">
            <h3 className="section-title">Poggyász információk</h3>
            <div className="baggage-grid">
              <div className="baggage-item">
                <div className="baggage-icon"><FaLuggageCart /></div>
                <div className="baggage-label">Feladott poggyász</div>
                <div className="baggage-value">{flightDetails.baggage.checkedBags} db</div>
              </div>
              <div className="baggage-item">
                <div className="baggage-icon"><FaShoppingBag /></div>
                <div className="baggage-label">Kézipoggyász</div>
                <div className="baggage-value">{flightDetails.baggage.cabinBag} db</div>
              </div>
              <div className="baggage-item">
                <div className="baggage-icon"><GiWeight /></div>
                <div className="baggage-label">Max. súly</div>
                <div className="baggage-value">{flightDetails.baggage.weight}</div>
              </div>
            </div>
          </section>

          <section className="details-section">
            <h3 className="section-title">Szolgáltatások</h3>
            <div className="services-list">
              {flightDetails.services.map((service, index) => (
                <div key={index} className="service-item">
                  <span className="service-check">✓</span>
                  <span className="service-text">{service}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="details-section booking-section">
            <h3 className="section-title">Árak és foglalás</h3>
            <div className="pricing-options">
              {flight.prices.ECONOMY > 0 && (
                <div className="pricing-card">
                  <div className="pricing-header">
                    <MdEventSeat className="class-icon" />
                    <span className="class-name">Economy</span>
                  </div>
                  <div className="pricing-details">
                    <div className="price-amount">{formatPriceSimple(flight.prices.ECONOMY)}</div>
                    <div className="seats-info">
                      <IoMdPerson />
                      <span>{flight.availableSeats.ECONOMY} hely</span>
                      <span className="seats-status">{getSeatStatusLabel(flight.availableSeats.ECONOMY)}</span>
                    </div>
                  </div>
                  <button
                    className="book-now-btn"
                    onClick={() => handleBooking('ECONOMY')}
                    disabled={!onBookingClick}
                  >
                    Foglalás most
                  </button>
                </div>
              )}

              {flight.prices.BUSINESS > 0 && (
                <div className="pricing-card featured">
                  <div className="featured-badge">Népszerű</div>
                  <div className="pricing-header">
                    <MdEventSeat className="class-icon" />
                    <span className="class-name">Business</span>
                  </div>
                  <div className="pricing-details">
                    <div className="price-amount">{formatPriceSimple(flight.prices.BUSINESS)}</div>
                    <div className="seats-info">
                      <IoMdPerson />
                      <span>{flight.availableSeats.BUSINESS} hely</span>
                      <span className="seats-status">{getSeatStatusLabel(flight.availableSeats.BUSINESS)}</span>
                    </div>
                  </div>
                  <button
                    className="book-now-btn"
                    onClick={() => handleBooking('BUSINESS')}
                    disabled={!onBookingClick}
                  >
                    Foglalás most
                  </button>
                </div>
              )}

              {flight.prices.FIRST > 0 && (
                <div className="pricing-card premium">
                  <div className="pricing-header">
                    <MdEventSeat className="class-icon" />
                    <span className="class-name">First Class</span>
                  </div>
                  <div className="pricing-details">
                    <div className="price-amount">{formatPriceSimple(flight.prices.FIRST)}</div>
                    <div className="seats-info">
                      <IoMdPerson />
                      <span>{flight.availableSeats.FIRST} hely</span>
                      <span className="seats-status">{getSeatStatusLabel(flight.availableSeats.FIRST)}</span>
                    </div>
                  </div>
                  <button
                    className="book-now-btn"
                    onClick={() => handleBooking('FIRST')}
                    disabled={!onBookingClick}
                  >
                    Foglalás most
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsModal;