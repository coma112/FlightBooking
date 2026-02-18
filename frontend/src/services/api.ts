const BASE_URL = 'http://localhost:8081/api';

export interface AirportDTO {
  iataCode: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightResponse {
  id: number;
  flightNumber: string;
  departureAirport: AirportDTO;
  arrivalAirport: AirportDTO;
  departureTime: string;
  arrivalTime: string;
  availableSeats: {
    ECONOMY: number;
    BUSINESS: number;
    FIRST: number;
  };
  prices: {
    ECONOMY: number;
    BUSINESS: number;
    FIRST: number;
  };
}

export interface SeatResponse {
  id: number;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  available: boolean;
  price: number;
  flight?: FlightResponse;
}

export interface PassengerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  passportNumber: string;
  dateOfBirth: string;
}

export interface BookingRequest {
  flightId: number;
  passengerDetails: PassengerDTO;
  seatNumber: string;
}

export interface BookingResponse {
  bookingReference: string;
  flight: FlightResponse;
  passenger: PassengerDTO;
  seatNumber: string;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  bookingDate: string;
}

export interface FlightSearchRequest {
  departureAirportCode: string;
  arrivalAirportCode: string;
  departureDate: string;
  passengers?: number;
  seatClass?: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      errorMsg = errBody.message || errBody.error || JSON.stringify(errBody);
    } catch {}
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return response.json();
}

export const flightApi = {
  searchFlights: (request: FlightSearchRequest): Promise<FlightResponse[]> =>
    apiFetch<FlightResponse[]>('/flights/search', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  getFlightById: (id: number): Promise<FlightResponse> =>
    apiFetch<FlightResponse>(`/flights/${id}`),

  getAvailableSeats: (
    flightId: number,
    seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST'
  ): Promise<SeatResponse[]> =>
    apiFetch<SeatResponse[]>(`/flights/${flightId}/seats?seatClass=${seatClass}`),
};

export const bookingApi = {

  createBooking: (request: BookingRequest): Promise<BookingResponse> =>
    apiFetch<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  getBooking: (reference: string): Promise<BookingResponse> =>
    apiFetch<BookingResponse>(`/bookings/${reference}`),

  confirmBooking: (reference: string): Promise<BookingResponse> =>
    apiFetch<BookingResponse>(`/bookings/${reference}/confirm`, {
      method: 'PUT',
    }),

  cancelBooking: (reference: string): Promise<void> =>
    apiFetch<void>(`/bookings/${reference}`, {
      method: 'DELETE',
    }),
};