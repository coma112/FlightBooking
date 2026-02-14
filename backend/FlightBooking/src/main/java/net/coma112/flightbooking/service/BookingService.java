package net.coma112.flightbooking.service;

import net.coma112.flightbooking.dto.BookingRequest;
import net.coma112.flightbooking.dto.BookingResponse;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    BookingResponse getBookingByReference(String reference);
    void cancelBooking(String reference);
    BookingResponse confirmBooking(String reference);
}