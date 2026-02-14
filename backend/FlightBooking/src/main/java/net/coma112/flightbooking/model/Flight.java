package net.coma112.flightbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.coma112.flightbooking.model.enums.FlightStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String flightNumber;

    // mert sok járat tartozik egy reptérhez
    @ManyToOne
    @JoinColumn(name = "departure_airport_id") // idegen kulcs
    private Airport departureAirport;

    @ManyToOne
    @JoinColumn(name = "arrival_airport_id")
    private Airport arrivalAirport;

    @ManyToOne
    @JoinColumn(name = "aircraft_id")
    private Aircraft aircraft;

    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;

    private BigDecimal basePrice;

    @Enumerated(EnumType.STRING)
    private FlightStatus status;
}
