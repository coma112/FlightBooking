package net.coma112.flightbooking.repository;

import net.coma112.flightbooking.model.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {

    // SELECT * FROM airports WHERE iata_code = ?
    Optional<Airport> findByIataCode(String iataCode);

    // SELECT * FROM airports WHERE city = ?
    List<Airport> findByCity(String city);

    // SELECT * FROM airports WHERE country = ?
    List<Airport> findByCountry(String country);

    // SELECT * FROM airports WHERE name LIKE %?%
    List<Airport> findByNameContaining(String keyword);

    // SELECT * FROM airports WHERE city = ? AND country = ?
    List<Airport> findByCityAndCountry(String city, String country);

    // SELECT COUNT(*) > 0 FROM airports WHERE iata_code = ?
    boolean existsByIataCode(String iataCode);
}
