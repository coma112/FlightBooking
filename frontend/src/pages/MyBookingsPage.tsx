import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './MyBookingsPage.css';
import {
  FaTicketAlt, FaSearch, FaSpinner, FaExclamationCircle,
  FaUser, FaEnvelope, FaPhone, FaPassport, FaCalendar,
  FaPlane, FaCheck, FaTimes, FaInfoCircle
} from 'react-icons/fa';
import { MdFlightTakeoff, MdFlightLand, MdEventSeat } from 'react-icons/md';
import { FaArrowRight } from 'react-icons/fa6';
import { formatPrice } from '../utils/priceCalculation';
import { formatDate, formatTime } from '../utils/dateUtils';
import { bookingApi, type BookingResponse } from '../services/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Függőben',
  CONFIRMED: 'Visszaigazolva',
  CANCELLED: 'Lemondva',
};

const CLASS_LABELS: Record<string, string> = {
  ECONOMY: 'Economy osztály',
  BUSINESS: 'Business osztály',
  FIRST: 'First Class',
};

const MyBookingsPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSearch = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setBooking(null);

    try {
      const result = await bookingApi.getBooking(code.trim().toUpperCase());
      setBooking(result);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleConfirm = async () => {
    if (!booking) return;
    setActionLoading(true);
    try {
      const updated = await bookingApi.confirmBooking(booking.bookingReference);
      setBooking(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!booking) return;
    setShowCancelModal(false);
    setActionLoading(true);
    try {
      await bookingApi.cancelBooking(booking.bookingReference);
      setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setActionLoading(false);
    }
  };

  const passengerFullName = booking
    ? `${booking.passenger.lastName} ${booking.passenger.firstName}`
    : '';

  return (
    <div className="my-bookings-page">
      <Navbar />

      <main className="my-bookings-main">
        <div className="bookings-header">
          <div className="bookings-header-content">
            <h1 className="bookings-page-title">Foglalásaim</h1>
            <p className="bookings-page-subtitle">
              Keresse meg foglalását a 6 karakteres foglalási kóddal
            </p>
          </div>
        </div>

        <div className="search-container">
          <div className="search-card">
            <h2>Foglalás keresése</h2>

            <div className="search-input-group">
              <div className="search-field">
                <label htmlFor="booking-code">Foglalási kód</label>
                <input
                  id="booking-code"
                  className={`booking-code-input ${notFound ? 'input-error' : ''}`}
                  type="text"
                  placeholder="ABC123"
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.toUpperCase());
                    setNotFound(false);
                  }}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  disabled={loading}
                />
              </div>
              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <><FaSpinner className="search-spinner" /> Keresés...</>
                ) : (
                  <><FaSearch /> Keresés</>
                )}
              </button>
            </div>

            {notFound && (
              <div className="error-banner">
                <FaExclamationCircle className="error-icon" />
                <span className="error-text">Foglalás nem található! Ellenőrizze a kódot.</span>
              </div>
            )}

            <p className="search-hint">
              A foglalási kód az e-mailben elküldött visszaigazolásban szerepel.
            </p>
          </div>
        </div>

        {booking && (
          <div className="result-container">
            <div className="booking-result-card">
              <div className="result-card-header">
                <h2>Foglalás #{booking.bookingReference}</h2>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status === 'CONFIRMED' && <FaCheck />}
                  {booking.status === 'PENDING' && <FaInfoCircle />}
                  {booking.status === 'CANCELLED' && <FaTimes />}
                  {STATUS_LABELS[booking.status as BookingStatus]}
                </span>
              </div>

              <div className="result-card-body">
                <div className="result-section">
                  <h3 className="result-section-title">Foglalási adatok</h3>
                  <div className="result-row">
                    <span className="result-label"><FaInfoCircle className="result-icon" /> Foglalási azonosító</span>
                    <span className="result-value">{booking.bookingReference}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaCalendar className="result-icon" /> Foglalás dátuma</span>
                    <span className="result-value">{formatDate(booking.bookingDate)}</span>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="result-section-title">Járat adatok</h3>
                  <div className="result-row">
                    <span className="result-label"><FaPlane className="result-icon" /> Járatszám</span>
                    <span className="result-value">{booking.flight.flightNumber}</span>
                  </div>

                  <div className="flight-route-display">
                    <div className="route-airport">
                      <MdFlightTakeoff style={{ fontSize: '1.5rem', color: '#2c5282' }} />
                      <div className="route-airport-code">{booking.flight.departureAirport.iataCode}</div>
                      <div className="route-airport-city">{booking.flight.departureAirport.city}</div>
                      <div className="route-airport-time">{formatTime(booking.flight.departureTime)}</div>
                    </div>
                    <div className="route-arrow-icon"><FaArrowRight /></div>
                    <div className="route-airport">
                      <MdFlightLand style={{ fontSize: '1.5rem', color: '#2c5282' }} />
                      <div className="route-airport-code">{booking.flight.arrivalAirport.iataCode}</div>
                      <div className="route-airport-city">{booking.flight.arrivalAirport.city}</div>
                      <div className="route-airport-time">{formatTime(booking.flight.arrivalTime)}</div>
                    </div>
                  </div>

                  <div className="result-row" style={{ marginTop: '1rem' }}>
                    <span className="result-label"><FaCalendar className="result-icon" /> Indulás dátuma</span>
                    <span className="result-value">{formatDate(booking.flight.departureTime)}</span>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="result-section-title">Utas adatok</h3>
                  <div className="result-row">
                    <span className="result-label"><FaUser className="result-icon" /> Név</span>
                    <span className="result-value">{passengerFullName}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaEnvelope className="result-icon" /> Email</span>
                    <span className="result-value">{booking.passenger.email}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaPhone className="result-icon" /> Telefon</span>
                    <span className="result-value">{booking.passenger.phoneNumber}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaPassport className="result-icon" /> Útlevél</span>
                    <span className="result-value">{booking.passenger.passportNumber}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaCalendar className="result-icon" /> Születési dátum</span>
                    <span className="result-value">{formatDate(booking.passenger.dateOfBirth)}</span>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="result-section-title">Osztály és ár</h3>
                  <div className="result-row">
                    <span className="result-label"><MdEventSeat className="result-icon" /> Szék</span>
                    <span className="result-value">{booking.seatNumber}</span>
                  </div>
                  <div className="total-price-display">
                    <span className="total-price-label">Végösszeg:</span>
                    <span className="total-price-value">{formatPrice(booking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {booking.status !== 'CANCELLED' && (
                <div className="action-buttons-row">
                  {booking.status === 'PENDING' && (
                    <button className="confirm-btn" onClick={handleConfirm} disabled={actionLoading}>
                      {actionLoading ? <FaSpinner className="search-spinner" /> : <FaCheck />}
                      Megerősítés
                    </button>
                  )}
                  <button
                    className="cancel-booking-btn"
                    onClick={() => setShowCancelModal(true)}
                    disabled={actionLoading}
                  >
                    <FaTimes /> Lemondás
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!booking && !notFound && !loading && (
          <div className="result-container">
            <div className="initial-state">
              <div className="initial-state-icon"><FaTicketAlt /></div>
              <p>Adja meg a foglalási kódját a kereséshez</p>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>Foglalás lemondása</h3>
            </div>
            <div className="modal-box-body">
              <p>
                Biztosan le szeretné mondani a <strong>{booking?.bookingReference}</strong> azonosítójú foglalást?
                Ez a művelet nem vonható vissza.
              </p>
              <div className="modal-buttons">
                <button className="modal-cancel-btn" onClick={() => setShowCancelModal(false)}>
                  Mégse
                </button>
                <button className="modal-confirm-btn" onClick={handleCancelConfirm}>
                  Igen, lemondás
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;