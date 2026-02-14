package net.coma112.flightbooking.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import net.coma112.flightbooking.model.enums.SeatClass;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightResponse {
    private Long id;
    private String flightNumber;
    private AirportDTO departureAirport;
    private AirportDTO arrivalAirport;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Map<SeatClass, Integer> availableSeats;
    private Map<SeatClass, BigDecimal> prices;
}