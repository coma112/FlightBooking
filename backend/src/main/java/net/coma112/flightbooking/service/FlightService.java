package net.coma112.flightbooking.service;

import net.coma112.flightbooking.dto.FlightResponse;
import net.coma112.flightbooking.dto.FlightSearchRequest;
import net.coma112.flightbooking.model.Seat;
import net.coma112.flightbooking.model.enums.SeatClass;

import java.util.List;

public interface FlightService {
    List<FlightResponse> searchFlights(FlightSearchRequest request);
    FlightResponse getFlightById(Long id);
    List<Seat> getAvailableSeats(Long flightId, SeatClass seatClass);
}
