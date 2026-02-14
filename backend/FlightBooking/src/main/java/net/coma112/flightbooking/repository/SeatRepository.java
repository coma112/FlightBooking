package net.coma112.flightbooking.repository;

import net.coma112.flightbooking.model.Flight;
import net.coma112.flightbooking.model.Seat;
import net.coma112.flightbooking.model.enums.SeatClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByFlightAndIsAvailable(Flight flight, boolean isAvailable);
    List<Seat> findByFlightAndSeatClass(Flight flight, SeatClass seatClass);
    int countByFlightAndSeatClassAndIsAvailable(Flight flight, SeatClass seatClass, boolean isAvailable);

    List<Seat> findByFlightAndSeatClassAndIsAvailable(
            Flight flight,
            SeatClass seatClass,
            boolean isAvailable
    );

    Optional<Seat> findByFlightAndSeatNumber(Flight flight, String seatNumber);
}