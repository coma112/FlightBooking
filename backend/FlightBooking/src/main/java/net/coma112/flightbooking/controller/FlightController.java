package net.coma112.flightbooking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.FlightResponse;
import net.coma112.flightbooking.dto.FlightSearchRequest;
import net.coma112.flightbooking.model.Seat;
import net.coma112.flightbooking.model.enums.SeatClass;
import net.coma112.flightbooking.service.FlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {
    // DI
    private final FlightService flightService;

    @PostMapping("/search")
    public ResponseEntity<List<FlightResponse>> searchFlights(@Valid @RequestBody FlightSearchRequest request) {

        List<FlightResponse> flights = flightService.searchFlights(request);

        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable Long id) {
        FlightResponse flight = flightService.getFlightById(id);

        return ResponseEntity.ok(flight);
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long id, @RequestParam SeatClass seatClass) {

        List<Seat> seats = flightService.getAvailableSeats(id, seatClass);

        return ResponseEntity.ok(seats);
    }
}