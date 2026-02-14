package net.coma112.flightbooking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import net.coma112.flightbooking.model.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String bookingReference;
    private FlightResponse flight;
    private PassengerDTO passenger;
    private String seatNumber;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private LocalDateTime bookingDate;
}