package net.coma112.flightbooking.repository;

import net.coma112.flightbooking.model.Airport;
import net.coma112.flightbooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByFlightNumber(String flightNumber);
    List<Flight> findByDepartureAirportAndArrivalAirport(Airport departureAirport, Airport arrivalAirport);
    List<Flight> findByDepartureTimeBetween(LocalDateTime departureTime, LocalDateTime arrivalTime);
    List<Flight> findByDepartureAirportAndArrivalAirportAndDepartureTimeBetween(
            Airport departureAirport,
            Airport arrivalAirport,
            LocalDateTime start,
            LocalDateTime end
    );
}
