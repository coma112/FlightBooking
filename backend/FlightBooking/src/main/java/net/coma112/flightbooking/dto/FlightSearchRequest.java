package net.coma112.flightbooking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import net.coma112.flightbooking.model.enums.SeatClass;
import java.time.LocalDate;

@Data
public class FlightSearchRequest {
    @NotBlank(message = "Muszáj ez!!!")
    @Size(min = 3, max = 3, message = "CSAK 3 hosszú!")
    private String departureAirportCode;

    @NotBlank(message = "Muszáj ez!!!")
    @Size(min = 3, max = 3, message = "CSAK 3 hosszú!")
    private String arrivalAirportCode;

    @NotNull(message = "Muszáj ez!!!")
    @Future(message = "Jövőbe lássál már")
    private LocalDate departureDate;

    @Min(value = 1, message = "kell legalább 1 utas")
    @Max(value = 9, message = "max 9 he!!!")
    private Integer passengers;

    private SeatClass seatClass;
}