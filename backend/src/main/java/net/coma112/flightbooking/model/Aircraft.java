package net.coma112.flightbooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.coma112.flightbooking.model.enums.AircraftType;

@Entity
@Table(name = "aircraft")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Aircraft {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AircraftType model;

    @Column(nullable = false, unique = true)
    @Pattern(regexp = "^[A-Z]{1,2}-[A-Z]{4}$", message = "Helytelen forma!")
    private String registrationNumber;

    @Column(nullable = false)
    private Integer totalSeats;
    private Integer economySeats;
    private Integer businessSeats;
    private Integer firstSeats;
}
