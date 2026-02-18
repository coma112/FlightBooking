import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BookingForm from '../components/booking/BookingForm';
import BookingSummary from '../components/booking/BookingSummary';
import './BookingPage.css';
import type { BookingFormData, BookingData } from '../types/booking';
import { bookingApi, flightApi } from '../services/api';

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

  const handleFormSubmit = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    setSeatError(null);

    try {
      const seats = await flightApi.getAvailableSeats(Number(flight.id), seatClass);

      if (!seats || seats.length === 0) {
        setSeatError(`Sajnos nincs szabad ${seatClass} szék ezen a járaton!`);
        setIsSubmitting(false);
        return;
      }

      const chosenSeat = seats[0];

      const bookingResponse = await bookingApi.createBooking({
        flightId: Number(flight.id),
        passengerDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          passportNumber: formData.passportNumber,
          dateOfBirth: formData.birthDate,
        },
        seatNumber: chosenSeat.seatNumber,
      });

      const bookingData: BookingData = {
        ...formData,
        flightId: flight.id,
        seatClass,
        totalPrice: Number(bookingResponse.totalPrice),
        bookingDate: bookingResponse.bookingDate,
        bookingReference: bookingResponse.bookingReference,
      };

      onConfirm(bookingData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Hiba történt a foglalás során';
      setSeatError(msg);
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                fontFamily: 'monospace',
                color: '#dc2626',
                fontWeight: 700,
              }}>
                ⚠️ {seatError}
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
    </div>
  );
};

export default BookingPage;