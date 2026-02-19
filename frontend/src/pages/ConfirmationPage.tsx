import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { FaHome, FaPrint, FaPlane, FaUser, FaEnvelope, FaPhone, FaPassport, FaCalendar, FaInfoCircle, FaCheck } from 'react-icons/fa';
import { MdFlightTakeoff, MdFlightLand, MdEventSeat } from 'react-icons/md';
import './ConfirmationPage.css';
import type { BookingData } from "../types/booking";
import { formatPrice } from "../utils/priceCalculation";
import { formatDate, formatTime } from "../utils/dateUtils";
import { getClassLabel } from "../utils/flightUtils";

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

interface ConfirmationPageProps {
    bookingData: BookingData;
    flight: Flight;
    onBackToHome: () => void;
}

const ConfirmationPage = ({ bookingData, flight, onBackToHome }: ConfirmationPageProps) => {
    const handlePrint = () => {
        window.print();
    };

    const bookingReference = bookingData.bookingReference ?? '—';

    return (
        <div className="confirmation-page">
            <Navbar />

            <main className="confirmation-main">
                <div className="confirmation-container">
                    <div className="success-header">
                        <div className="success-icon">
                            <span className="checkmark"><FaCheck /></span>
                        </div>
                        <h1 className="success-title">Sikeres foglalás!</h1>
                        <p className="success-subtitle">
                            Foglalási visszaigazolást elküldtük a megadott email címre.
                        </p>
                    </div>

                    <div className="booking-details-card">
                        <div className="card-header">
                            <h2>Foglalási részletek</h2>
                        </div>

                        <div className="card-body">
                            <div className="details-section">
                                <h3 className="section-title">Foglalási információk</h3>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaInfoCircle className="label-icon" />
                                        Foglalási azonosító
                                    </span>
                                    <span className="detail-value" style={{ letterSpacing: '2px', fontSize: '1.1rem' }}>
                                        {bookingReference}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaCalendar className="label-icon" />
                                        Foglalás dátuma
                                    </span>
                                    <span className="detail-value">
                                        {formatDate(bookingData.bookingDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3 className="section-title">Járat információk</h3>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaPlane className="label-icon" />
                                        Járatszám
                                    </span>
                                    <span className="detail-value">{flight.flightNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaPlane className="label-icon" />
                                        Légitársaság
                                    </span>
                                    <span className="detail-value">{flight.airline}</span>
                                </div>

                                <div className="flight-route">
                                    <div className="route-point">
                                        <MdFlightTakeoff style={{ fontSize: '1.5rem', color: '#2c5282', marginBottom: '0.5rem' }} />
                                        <div className="route-code">{flight.departureAirport.code}</div>
                                        <div className="route-city">{flight.departureAirport.city}</div>
                                        <div className="route-city" style={{ marginTop: '0.25rem', fontWeight: 700, color: '#fbbf24' }}>
                                            {formatTime(flight.departureTime)}
                                        </div>
                                    </div>

                                    <div className="route-arrow">→</div>

                                    <div className="route-point">
                                        <MdFlightLand style={{ fontSize: '1.5rem', color: '#2c5282', marginBottom: '0.5rem' }} />
                                        <div className="route-code">{flight.arrivalAirport.code}</div>
                                        <div className="route-city">{flight.arrivalAirport.city}</div>
                                        <div className="route-city" style={{ marginTop: '0.25rem', fontWeight: 700, color: '#fbbf24' }}>
                                            {formatTime(flight.arrivalTime)}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-row" style={{ marginTop: '1rem' }}>
                                    <span className="detail-label">
                                        <FaCalendar className="label-icon" />
                                        Indulás dátuma
                                    </span>
                                    <span className="detail-value">
                                        {formatDate(flight.departureTime)}
                                    </span>
                                </div>
                            </div>

                            <div className="details-section">
                                <h3 className="section-title">Utas adatok</h3>
                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaUser className="label-icon" />
                                        Név
                                    </span>
                                    <span className="detail-value">
                                        {bookingData.lastName} {bookingData.firstName}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaEnvelope className="label-icon" />
                                        Email
                                    </span>
                                    <span className="detail-value">
                                        {bookingData.email}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaPhone className="label-icon" />
                                        Telefonszám
                                    </span>
                                    <span className="detail-value">
                                        {bookingData.phone}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaPassport className="label-icon" />
                                        Útlevélszám
                                    </span>
                                    <span className="detail-value">
                                        {bookingData.passportNumber}
                                    </span>
                                </div>

                                <div className="detail-row">
                                    <span className="detail-label">
                                        <FaCalendar className="label-icon" />
                                        Születési dátum
                                    </span>
                                    <span className="detail-value">
                                        {formatDate(bookingData.birthDate)}
                                    </span>
                                </div>

                                <div className="details-section">
                                    <h3 className="section-title">Osztály és ár</h3>
                                    <div className="detail-row">
                                        <span className="detail-label">
                                            <MdEventSeat className="label-icon" />
                                            Osztály
                                        </span>
                                        <span className="detail-value">{getClassLabel(bookingData.seatClass)}</span>
                                    </div>

                                    <div className="total-price-row">
                                        <span className="total-label">Végösszeg:</span>
                                        <span className="total-value">{formatPrice(bookingData.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-notice">
                            <h3 className="notice-title">
                                <FaInfoCircle className="notice-icon" />
                                Fontos információk
                            </h3>
                            <p className="notice-text">
                                Kérjük, érkezzen legalább 2 órával az indulás előtt a repülőtérre.
                                A jegyet és az útlevelét tartsa kéznél. A foglalási visszaigazolást
                                elküldtük a megadott email címre ({bookingData.email}).
                                <br /><br />
                                <strong>Foglalási kód: {bookingReference}</strong> – ezzel tud a "Foglalásaim" oldalon visszakeresni.
                            </p>
                        </div>

                        <div className="action-buttons">
                            <button className="secondary-btn" onClick={handlePrint}>
                                <FaPrint className="btn-icon" />
                                Nyomtatás
                            </button>
                            <button className="primary-btn" onClick={onBackToHome}>
                                <FaHome className="btn-icon" />
                                Vissza a főoldalra
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ConfirmationPage;