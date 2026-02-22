import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BookingForm from '../components/booking/BookingForm';
import BookingSummary from '../components/booking/BookingSummary';
import SeatSelector from '../components/booking/SeatSelector';
import PaymentModal from '../components/payment/PaymentModal';
import './BookingPage.css';
import type { BookingFormData, BookingData } from '../types/booking';
import { bookingApi } from '../services/api';
import type { SeatResponse } from '../services/api';

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

interface BookingPageProps {
  flight: Flight;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  departureDate: string;
  onConfirm: (bookingData: BookingData) => void;
  onCancel: () => void;
}

const BookingPage = ({
  flight,
  seatClass,
  departureDate,
  onConfirm,
  onCancel,
}: BookingPageProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [showSeatSelector, setShowSeatSelector] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<BookingFormData | null>(null);

  // Fizetési modal state-ek
  const [showPayment, setShowPayment] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{
    reference: string;
    price: number;
    bookingDate: string;
    formData: BookingFormData;
  } | null>(null);

  // 1. lépés: form kitöltése → ülésválasztó megnyitása
  const handleFormSubmit = (formData: BookingFormData) => {
    setSeatError(null);
    setCurrentFormData(formData);
    setShowSeatSelector(true);
  };

  // 2. lépés: ülés kiválasztása → foglalás létrehozása a backenden → fizetési modal megnyitása
  const handleSeatConfirm = async (seat: SeatResponse) => {
    if (!currentFormData) return;
    setShowSeatSelector(false);
    setIsSubmitting(true);
    setSeatError(null);

    try {
      const bookingResponse = await bookingApi.createBooking({
        flightId: Number(flight.id),
        passengerDetails: {
          firstName: currentFormData.firstName,
          lastName: currentFormData.lastName,
          email: currentFormData.email,
          phoneNumber: currentFormData.phone,
          passportNumber: currentFormData.passportNumber,
          dateOfBirth: currentFormData.birthDate,
        },
        seatNumber: seat.seatNumber,
      });

      // Foglalás létrejött (PENDING státuszban), most jön a fizetés
      setPendingBooking({
        reference: bookingResponse.bookingReference,
        price: Number(bookingResponse.totalPrice),
        bookingDate: bookingResponse.bookingDate,
        formData: currentFormData,
      });
      setShowPayment(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Hiba történt a foglalás során';
      setSeatError(msg);
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. lépés: sikeres fizetés → visszaigazolás oldalra navigálás
  const handlePaymentSuccess = (paymentMethod: string) => {
    if (!pendingBooking) return;

    const bookingData: BookingData = {
      ...pendingBooking.formData,
      flightId: flight.id,
      seatClass,
      totalPrice: pendingBooking.price,
      bookingDate: pendingBooking.bookingDate,
      bookingReference: pendingBooking.reference,
      paymentMethod,
    };

    setShowPayment(false);
    onConfirm(bookingData);
  };

  // Fizetési modal bezárása (pl. ha a felhasználó mégsem fizet)
  const handlePaymentClose = () => {
    setShowPayment(false);
    // A foglalás PENDING státuszban marad, a felhasználó később visszakeresheti
  };

  const passengerName = currentFormData
    ? `${currentFormData.lastName} ${currentFormData.firstName}`
    : '';

  return (
    <div className="booking-page">
      <Navbar />

      <main className="booking-main">
        <div className="booking-header">
          <div className="booking-header-content">
            <button className="back-button" onClick={onCancel}>
              ← Vissza a járatokhoz
            </button>
            <h1 className="page-title">Foglalás véglegesítése</h1>
            <p className="page-subtitle">
              Adja meg az utazás adatait a foglalás befejezéséhez
            </p>
          </div>
        </div>

        <div className="booking-container">
          <div className="booking-form-section">
            {seatError && (
              <div style={{
                background: '#fef2f2',
                border: '2px solid #fca5a5',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#dc2626',
                fontWeight: 700,
              }}>
                {seatError}
              </div>
            )}

            {isSubmitting && (
              <div style={{
                background: '#e8f4fd',
                border: '2px solid #0078D4',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#005A9E',
                fontWeight: 700,
                textAlign: 'center',
              }}>
                ⏳ Foglalás létrehozása folyamatban...
              </div>
            )}

            <BookingForm
              onSubmit={handleFormSubmit}
              loading={isSubmitting}
            />
          </div>

          <aside className="booking-summary-section">
            <BookingSummary
              flight={flight}
              seatClass={seatClass}
              departureDate={departureDate}
            />
          </aside>
        </div>
      </main>

      <Footer />

      {/* 2. lépés: Ülésválasztó */}
      {showSeatSelector && (
        <SeatSelector
          flightId={Number(flight.id)}
          flightNumber={flight.flightNumber}
          departureCode={flight.departureAirport.code}
          arrivalCode={flight.arrivalAirport.code}
          seatClass={seatClass}
          onConfirm={handleSeatConfirm}
          onClose={() => setShowSeatSelector(false)}
        />
      )}

      {/* 3. lépés: Fizetési modal */}
      {showPayment && pendingBooking && (
        <PaymentModal
          bookingReference={pendingBooking.reference}
          totalPrice={pendingBooking.price}
          flightNumber={flight.flightNumber}
          passengerName={passengerName}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
};

export default BookingPage;