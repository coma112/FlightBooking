export interface BookingFormData {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  passportNumber: string;
  birthDate: string;
}

export interface BookingData extends BookingFormData {
  flightId: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  totalPrice: number;
  bookingDate: string;
  bookingReference?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  classMultiplier: number;
  earlyBirdDiscount: number;
  lastMinuteFee: number;
  seasonalFee: number;
  total: number;
}