package net.coma112.flightbooking.repository;

import net.coma112.flightbooking.model.Booking;
import net.coma112.flightbooking.model.Passenger;
import net.coma112.flightbooking.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String reference);
    List<Booking> findByPassenger(Passenger passenger);
    List<Booking> findByStatus(BookingStatus status);
}
