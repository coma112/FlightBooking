package net.coma112.flightbooking.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentIntentRequest {
    private BigDecimal amount;
    private String bookingReference;
    private String flightNumber;
    private String currency = "huf";
}
