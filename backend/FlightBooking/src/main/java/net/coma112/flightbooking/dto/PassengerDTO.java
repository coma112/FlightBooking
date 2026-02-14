package net.coma112.flightbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PassengerDTO {
    @NotBlank(message = "Muszáj!!!")
    private String firstName;

    @NotBlank(message = "Muszáj!!!")
    private String lastName;

    @NotBlank(message = "Muszáj!!!")
    @Email
    private String email;

    @NotBlank(message = "Muszáj!!!")
    private String phoneNumber;

    @NotBlank(message = "Muszáj!!!")
    private String passportNumber;

    @NotNull(message = "Köthelező")
    @Past(message = "jaja most születtél nem? na húzzá vissza he")
    private LocalDate dateOfBirth;
}
