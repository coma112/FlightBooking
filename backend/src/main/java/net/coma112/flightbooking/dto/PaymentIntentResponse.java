package net.coma112.flightbooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    private Long amount;
}
