package net.coma112.flightbooking.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AirportDTO {
    private String iataCode;
    private String name;
    private String city;
    private String country;
}