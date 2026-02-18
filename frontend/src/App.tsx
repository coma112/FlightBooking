import { useState } from 'react';
import HomePage from './pages/HomePage';
import FlightListPage from './pages/FlightListPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import './App.css';
import type { BookingData } from './types/booking';
import ConfirmationPage from './pages/ConfirmationPage';

type Page = 'home' | 'flights' | 'booking' | 'confirmation' | 'my-bookings';

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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedClass, setSelectedClass] = useState<'ECONOMY' | 'BUSINESS' | 'FIRST'>('ECONOMY');
  const [departureDate] = useState<string>('2026-03-15'); 
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  (window as unknown as Record<string, unknown>).__navigateTo = navigateTo;

  const handleBookingClick = (flight: Flight, seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST') => {
    setSelectedFlight(flight);
    setSelectedClass(seatClass);
    navigateTo('booking');
  };

  const handleBookingConfirm = (data: BookingData) => {
    setBookingData(data);
    navigateTo('confirmation');
  };

  const handleBookingCancel = () => {
    navigateTo('flights');
  };

  const handleBackToHome = () => {
    setSelectedFlight(null);
    setSelectedClass('ECONOMY');
    setBookingData(null);
    navigateTo('home');
  };

  if (currentPage === 'booking' && selectedFlight) {
    return (
      <BookingPage
        flight={selectedFlight}
        seatClass={selectedClass}
        departureDate={departureDate}
        onConfirm={handleBookingConfirm}
        onCancel={handleBookingCancel}
      />
    );
  }

  if (currentPage === 'confirmation' && bookingData && selectedFlight) {
    return (
      <ConfirmationPage 
        bookingData={bookingData}
        flight={selectedFlight}
        onBackToHome={handleBackToHome}
      />
    );
  }

  if (currentPage === 'flights') {
    return <FlightListPage onBookingClick={handleBookingClick} />;
  }

  if (currentPage === 'my-bookings') {
    return <MyBookingsPage />
  }

  return <HomePage onSearch={() => navigateTo('flights')} />;
}

export default App;