package net.coma112.flightbooking.service.impl;

import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.*;
import net.coma112.flightbooking.model.*;
import net.coma112.flightbooking.model.enums.BookingStatus;
import net.coma112.flightbooking.model.enums.SeatClass;
import net.coma112.flightbooking.repository.*;
import net.coma112.flightbooking.service.BookingService;
import net.coma112.flightbooking.service.PassengerService;
import net.coma112.flightbooking.service.PricingService;
import org.jetbrains.annotations.Contract;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final SeatRepository seatRepository;
    private final PassengerService passengerService;
    private final PricingService pricingService;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight nincs: " + request.getFlightId()));

        Seat seat = seatRepository.findByFlightAndSeatNumber(flight, request.getSeatNumber())
                .orElseThrow(() -> new RuntimeException("Seat nincs: " + request.getSeatNumber()));

        if (!seat.isAvailable()) {
            throw new RuntimeException("Seat " + request.getSeatNumber() + " mán foglalt");
        }

        Passenger passenger = passengerService.createOrUpdatePassenger(request.getPassengerDetails());

        BigDecimal finalPrice = pricingService.calculatePrice(
                flight,
                seat.getSeatClass(),
                LocalDateTime.now()
        );

        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setFlight(flight);
        booking.setPassenger(passenger);
        booking.setSeat(seat);
        booking.setTotalPrice(finalPrice);
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookingDate(LocalDateTime.now());

        seat.setAvailable(false);
        seatRepository.save(seat);

        Booking savedBooking = bookingRepository.save(booking);

        return convertToBookingResponse(savedBooking);
    }

    @Override
    public BookingResponse getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking nincs: " + reference));

        return convertToBookingResponse(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking nincs: " + reference));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking már cancellelve");
        }

        Seat seat = booking.getSeat();
        seat.setAvailable(true);
        seatRepository.save(seat);

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public BookingResponse confirmBooking(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking nincs: " + reference));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Csak pending!");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking confirmedBooking = bookingRepository.save(booking);

        return convertToBookingResponse(confirmedBooking);
    }

    private @NonNull BookingResponse convertToBookingResponse(@NonNull Booking booking) {
        BookingResponse response = new BookingResponse();

        response.setBookingReference(booking.getBookingReference());
        response.setStatus(booking.getStatus());
        response.setBookingDate(booking.getBookingDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setSeatNumber(booking.getSeat().getSeatNumber());
        response.setFlight(convertToFlightResponse(booking.getFlight()));
        response.setPassenger(convertToPassengerDTO(booking.getPassenger()));

        return response;
    }

    private @NonNull FlightResponse convertToFlightResponse(@NonNull Flight flight) {
        FlightResponse response = new FlightResponse();

        response.setId(flight.getId());
        response.setFlightNumber(flight.getFlightNumber());
        response.setDepartureTime(flight.getDepartureTime());
        response.setArrivalTime(flight.getArrivalTime());

        response.setDepartureAirport(convertToAirportDTO(flight.getDepartureAirport()));
        response.setArrivalAirport(convertToAirportDTO(flight.getArrivalAirport()));

        response.setAvailableSeats(new HashMap<>());

        Map<SeatClass, BigDecimal> prices = new HashMap<>();
        prices.put(SeatClass.ECONOMY, flight.getBasePrice());
        prices.put(SeatClass.BUSINESS, flight.getBasePrice().multiply(new BigDecimal("2.5")));
        prices.put(SeatClass.FIRST, flight.getBasePrice().multiply(new BigDecimal("4.0")));
        response.setPrices(prices);

        return response;
    }

    @Contract("_ -> new")
    private @NonNull AirportDTO convertToAirportDTO(@NonNull Airport airport) {
        return new AirportDTO(
                airport.getIataCode(),
                airport.getName(),
                airport.getCity(),
                airport.getCountry()
        );
    }

    private @NonNull PassengerDTO convertToPassengerDTO(@NonNull Passenger passenger) {
        PassengerDTO dto = new PassengerDTO();
        dto.setFirstName(passenger.getFirstName());
        dto.setLastName(passenger.getLastName());
        dto.setEmail(passenger.getEmail());
        dto.setPhoneNumber(passenger.getPhoneNumber());
        dto.setPassportNumber(passenger.getPassportNumber());
        dto.setDateOfBirth(passenger.getDateOfBirth());
        return dto;
    }

    private @NonNull String generateBookingReference() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder reference = new StringBuilder(6);

        for (int i = 0; i < 6; i++) {
            reference.append(chars.charAt(random.nextInt(chars.length())));
        }

        return reference.toString();
    }
}