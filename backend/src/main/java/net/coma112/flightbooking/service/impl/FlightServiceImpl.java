package net.coma112.flightbooking.service.impl;

import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.AirportDTO;
import net.coma112.flightbooking.dto.FlightResponse;
import net.coma112.flightbooking.dto.FlightSearchRequest;
import net.coma112.flightbooking.model.Airport;
import net.coma112.flightbooking.model.Flight;
import net.coma112.flightbooking.model.Seat;
import net.coma112.flightbooking.model.enums.SeatClass;
import net.coma112.flightbooking.repository.AirportRepository;
import net.coma112.flightbooking.repository.FlightRepository;
import net.coma112.flightbooking.repository.SeatRepository;
import net.coma112.flightbooking.service.FlightService;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    // DI
    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final SeatRepository seatRepository;

    @Override
    public List<FlightResponse> searchFlights(FlightSearchRequest request) {
        Airport departureAirport = airportRepository.findByIataCode(request.getDepartureAirportCode())
                .orElseThrow(() -> new RuntimeException("Nem található departure!"));

        Airport arrivalAirport = airportRepository.findByIataCode(request.getArrivalAirportCode())
                .orElseThrow(() -> new RuntimeException("Nem található arrival!"));

        LocalDateTime startOfDay = request.getDepartureDate().atStartOfDay();
        LocalDateTime endOfDay = request.getDepartureDate().atTime(23, 59, 59);

        List<Flight> flights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureTimeBetween(
                departureAirport,
                arrivalAirport,
                startOfDay,
                endOfDay
        );

        List<FlightResponse> responses = Collections.synchronizedList(new ArrayList<>());

        for (Flight flight : flights) {
            FlightResponse response = convertToFlightResponse(flight);
            responses.add(response);
        }

        return responses;
    }

    @Override
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nincs flight: " + id));

        return convertToFlightResponse(flight);
    }

    @Override
    public List<Seat> getAvailableSeats(Long flightId, SeatClass seatClass) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Nincs flight: " + flightId));

        return seatRepository.findByFlightAndSeatClassAndIsAvailable(flight, seatClass, true);
    }

    private @NonNull FlightResponse convertToFlightResponse(@NonNull Flight flight) {
        FlightResponse response = new FlightResponse();

        response.setId(flight.getId());
        response.setFlightNumber(flight.getFlightNumber());
        response.setDepartureTime(flight.getDepartureTime());
        response.setArrivalTime(flight.getArrivalTime());

        response.setDepartureAirport(convertToAirportDTO(flight.getDepartureAirport()));
        response.setArrivalAirport(convertToAirportDTO(flight.getArrivalAirport()));

        Map<SeatClass, Integer> availableSeats = new HashMap<>();
        for (SeatClass seatClass : SeatClass.values()) {
            int count = seatRepository.countByFlightAndSeatClassAndIsAvailable(
                    flight,
                    seatClass,
                    true  // csak a szabad ülések
            );
            availableSeats.put(seatClass, count);
        }
        response.setAvailableSeats(availableSeats);

        Map<SeatClass, BigDecimal> prices = calculatePrices(flight.getBasePrice());
        response.setPrices(prices);

        return response;
    }

    private @NonNull AirportDTO convertToAirportDTO(@NonNull Airport airport) {
        AirportDTO dto = new AirportDTO();
        dto.setIataCode(airport.getIataCode());
        dto.setName(airport.getName());
        dto.setCity(airport.getCity());
        dto.setCountry(airport.getCountry());
        return dto;
    }

    private @NonNull ConcurrentHashMap<SeatClass, BigDecimal> calculatePrices(BigDecimal basePrice) {
        ConcurrentHashMap<SeatClass, BigDecimal> prices = new ConcurrentHashMap<>();

        prices.put(SeatClass.ECONOMY, basePrice);
        prices.put(SeatClass.BUSINESS, basePrice.multiply(new BigDecimal("2.5")));
        prices.put(SeatClass.FIRST, basePrice.multiply(new BigDecimal("4.0")));

        return prices;
    }
}
