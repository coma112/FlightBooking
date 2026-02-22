package net.coma112.flightbooking.dto;

import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private String bookingReference;
    private String paymentIntentId;
    private String paymentMethod; // stripe, barion, apple_pay, google_pay
}
