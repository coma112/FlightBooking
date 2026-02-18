package net.coma112.flightbooking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull(message = "Muszáj ez!!!")
    private Long flightId;

    @Valid
    @NotNull(message = "Muszáj ez!!!")
    private PassengerDTO passengerDetails;

    @NotBlank(message = "Muszáj ez!!!")
    private String seatNumber;
}
