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

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

interface MockBooking {
  bookingReference: string;
  status: BookingStatus;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  passportNumber: string;
  birthDate: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  departureAirport: { name: string; code: string; city: string };
  arrivalAirport: { name: string; code: string; city: string };
  departureTime: string;
  arrivalTime: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  totalPrice: number;
  bookingDate: string;
}

const MOCK_BOOKINGS: Record<string, MockBooking> = {
  'SKY001': {
    bookingReference: 'SKY001',
    status: 'PENDING',
    lastName: 'Kovács',
    firstName: 'Anna',
    email: 'anna.kovacs@example.com',
    phone: '+36 30 123 4567',
    passportNumber: 'AB1234567',
    birthDate: '1990-05-15',
    flightId: 'LH1234',
    flightNumber: 'LH1234',
    airline: 'Lufthansa',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T08:30:00',
    arrivalTime: '2026-03-15T10:45:00',
    seatClass: 'ECONOMY',
    totalPrice: 22015,
    bookingDate: '2026-02-10T12:00:00',
  },
  'SKY002': {
    bookingReference: 'SKY002',
    status: 'CONFIRMED',
    lastName: 'Nagy',
    firstName: 'Péter',
    email: 'peter.nagy@example.com',
    phone: '+36 70 987 6543',
    passportNumber: 'CD9876543',
    birthDate: '1985-11-22',
    flightId: 'LH5678',
    flightNumber: 'LH5678',
    airline: 'Lufthansa',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T14:15:00',
    arrivalTime: '2026-03-15T16:30:00',
    seatClass: 'BUSINESS',
    totalPrice: 81515,
    bookingDate: '2026-02-01T09:30:00',
  },
  'SKY003': {
    bookingReference: 'SKY003',
    status: 'CANCELLED',
    lastName: 'Szabó',
    firstName: 'Mária',
    email: 'maria.szabo@example.com',
    phone: '+36 20 555 1234',
    passportNumber: 'EF5555555',
    birthDate: '1978-03-08',
    flightId: 'LH9012',
    flightNumber: 'LH9012',
    airline: 'Lufthansa',
    departureAirport: { name: 'Budapest Liszt Ferenc', code: 'BUD', city: 'Budapest' },
    arrivalAirport: { name: 'London Heathrow', code: 'LHR', city: 'London' },
    departureTime: '2026-03-15T19:45:00',
    arrivalTime: '2026-03-15T22:00:00',
    seatClass: 'FIRST',
    totalPrice: 152415,
    bookingDate: '2026-01-25T16:45:00',
  },
};

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
  const [booking, setBooking] = useState<MockBooking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSearch = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setNotFound(false);
    setBooking(null);

    await new Promise(r => setTimeout(r, 900));

    const found = MOCK_BOOKINGS[code.trim().toUpperCase()];
    if (found) {
      setBooking({ ...found });
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleConfirm = async () => {
    if (!booking) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setBooking(prev => prev ? { ...prev, status: 'CONFIRMED' } : null);
    if (booking.bookingReference in MOCK_BOOKINGS) {
      MOCK_BOOKINGS[booking.bookingReference].status = 'CONFIRMED';
    }
    setLoading(false);
  };

  const handleCancelConfirm = async () => {
    if (!booking) return;
    setShowCancelModal(false);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    if (booking.bookingReference in MOCK_BOOKINGS) {
      MOCK_BOOKINGS[booking.bookingReference].status = 'CANCELLED';
    }
    setLoading(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });

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
                  placeholder="SKY001"
                  value={code}
                  onChange={e => {
                    setCode(e.target.value.toUpperCase());
                    setNotFound(false);
                  }}
                  onKeyDown={handleKeyDown}
                  maxLength={10}
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
              Próbálja ki: SKY001 (Függőben) • SKY002 (Visszaigazolva) • SKY003 (Lemondva)
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
                  {STATUS_LABELS[booking.status]}
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
                    <span className="result-value">{booking.flightNumber}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaPlane className="result-icon" /> Légitársaság</span>
                    <span className="result-value">{booking.airline}</span>
                  </div>

                  <div className="flight-route-display">
                    <div className="route-airport">
                      <MdFlightTakeoff style={{ fontSize: '1.5rem', color: '#2c5282' }} />
                      <div className="route-airport-code">{booking.departureAirport.code}</div>
                      <div className="route-airport-city">{booking.departureAirport.city}</div>
                      <div className="route-airport-time">{formatTime(booking.departureTime)}</div>
                    </div>
                    <div className="route-arrow-icon"><FaArrowRight /></div>
                    <div className="route-airport">
                      <MdFlightLand style={{ fontSize: '1.5rem', color: '#2c5282' }} />
                      <div className="route-airport-code">{booking.arrivalAirport.code}</div>
                      <div className="route-airport-city">{booking.arrivalAirport.city}</div>
                      <div className="route-airport-time">{formatTime(booking.arrivalTime)}</div>
                    </div>
                  </div>

                  <div className="result-row" style={{ marginTop: '1rem' }}>
                    <span className="result-label"><FaCalendar className="result-icon" /> Indulás dátuma</span>
                    <span className="result-value">{formatDate(booking.departureTime)}</span>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="result-section-title">Utas adatok</h3>
                  <div className="result-row">
                    <span className="result-label"><FaUser className="result-icon" /> Név</span>
                    <span className="result-value">{booking.lastName} {booking.firstName}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaEnvelope className="result-icon" /> Email</span>
                    <span className="result-value">{booking.email}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaPhone className="result-icon" /> Telefonszám</span>
                    <span className="result-value">{booking.phone}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaPassport className="result-icon" /> Útlevélszám</span>
                    <span className="result-value">{booking.passportNumber}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-label"><FaCalendar className="result-icon" /> Születési dátum</span>
                    <span className="result-value">{formatDate(booking.birthDate)}</span>
                  </div>
                </div>

                <div className="result-section">
                  <h3 className="result-section-title">Osztály és ár</h3>
                  <div className="result-row">
                    <span className="result-label"><MdEventSeat className="result-icon" /> Osztály</span>
                    <span className="result-value">{CLASS_LABELS[booking.seatClass]}</span>
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
                    <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
                      {loading ? <FaSpinner className="search-spinner" /> : <FaCheck />}
                      Megerősítés
                    </button>
                  )}
                  <button
                    className="cancel-booking-btn"
                    onClick={() => setShowCancelModal(true)}
                    disabled={loading}
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