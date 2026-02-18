package net.coma112.flightbooking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.BookingRequest;
import net.coma112.flightbooking.dto.BookingResponse;
import net.coma112.flightbooking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    // DI
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{reference}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable String reference) {

        BookingResponse response = bookingService.getBookingByReference(reference);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reference}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable String reference) {

        BookingResponse response = bookingService.confirmBooking(reference);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reference}")
    public ResponseEntity<Void> cancelBooking(@PathVariable String reference) {

        bookingService.cancelBooking(reference);

        return ResponseEntity.noContent().build();
    }
}