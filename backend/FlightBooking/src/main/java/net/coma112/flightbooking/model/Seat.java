package net.coma112.flightbooking.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.coma112.flightbooking.model.enums.SeatClass;

import java.math.BigDecimal;

@Entity
@Table(name = "seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // több az egyhez
    @ManyToOne
    @JoinColumn(name = "flight_id")
    private Flight flight;

    private String seatNumber;

    @Enumerated(EnumType.STRING)
    private SeatClass seatClass;

    private boolean isAvailable;

    private BigDecimal price;
}
