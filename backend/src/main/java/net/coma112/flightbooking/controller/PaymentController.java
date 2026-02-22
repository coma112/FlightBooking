package net.coma112.flightbooking.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.BookingResponse;
import net.coma112.flightbooking.dto.PaymentConfirmRequest;
import net.coma112.flightbooking.dto.PaymentIntentRequest;
import net.coma112.flightbooking.dto.PaymentIntentResponse;
import net.coma112.flightbooking.service.BookingService;
import net.coma112.flightbooking.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final BookingService bookingService;
    private final EmailService emailService;

    @Value("${stripe.secret.key:sk_test_placeholder}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@RequestBody PaymentIntentRequest request) {
        try {
            long amountInHuf = request.getAmount().longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInHuf * 100L) // stripe cent-et használ
                    .setCurrency("huf")
                    .setDescription("SkyBooker repülőjegy foglalás: " + request.getBookingReference())
                    .putMetadata("bookingReference", request.getBookingReference())
                    .putMetadata("flightNumber", request.getFlightNumber() != null ? request.getFlightNumber() : "")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            return ResponseEntity.ok(new PaymentIntentResponse(
                    intent.getId(),
                    intent.getClientSecret(),
                    intent.getStatus(),
                    amountInHuf
            ));
        } catch (StripeException exception) {
            return ResponseEntity.ok(new PaymentIntentResponse(
                    "pi_test_mock_" + System.currentTimeMillis(),
                    "pi_test_mock_secret_" + System.currentTimeMillis(),
                    "requires_payment_method",
                    request.getAmount().longValue()
            ));
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmPayment(@RequestBody PaymentConfirmRequest request) {
        try {
            BookingResponse booking = bookingService.confirmBooking(request.getBookingReference());
            emailService.sendBookingConfirmationEmail(booking, request.getPaymentMethod());

            Map<String, Object> response = new HashMap<>();

            response.put("success", true);
            response.put("bookingReference", booking.getBookingReference());
            response.put("status", booking.getStatus());
            response.put("message", "Fizetés sikeres! Visszaigazoló emailt küldtünk!");

            return ResponseEntity.ok(response);
        } catch (Exception exception) {
            Map<String, Object> response = new HashMap<>();

            response.put("success", false);
            response.put("message", exception.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/barion/pay")
    public ResponseEntity<Map<String, Object>> barionPay(@RequestBody PaymentConfirmRequest request) {
        return confirmPayment(request);
    }
}
