package net.coma112.flightbooking.service;

import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.model.Flight;
import net.coma112.flightbooking.model.enums.SeatClass;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class PricingService {
    public BigDecimal calculatePrice(@NonNull Flight flight, SeatClass seatClass, LocalDateTime bookingDate) {
        BigDecimal basePrice = flight.getBasePrice();

        BigDecimal seatClassMultiplier = getSeatClassMultiplier(seatClass);
        BigDecimal price = basePrice.multiply(seatClassMultiplier);

        price = applyBookingTimeModifier(price, bookingDate, flight.getDepartureTime());
        price = applySeasonalSurcharge(price, flight.getDepartureTime());

        return price.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Seat class szorzó
     * ECONOMY: 1.0x
     * BUSINESS: 2.5x
     * FIRST: 4.0x
     */
    private @NonNull BigDecimal getSeatClassMultiplier(@NonNull SeatClass seatClass) {
        return switch (seatClass) {
            case ECONOMY -> new BigDecimal("1.0");
            case BUSINESS -> new BigDecimal("2.5");
            case FIRST -> new BigDecimal("4.0");
        };
    }

    /**
     * Early bird / Last minute módosító
     * - 30+ nap előre: -15% (early bird discount)
     * - 7 napon belül: +25% (last minute surcharge)
     */
    private BigDecimal applyBookingTimeModifier(BigDecimal price, LocalDateTime bookingDate, LocalDateTime departureTime) {
        long daysUntilDeparture = ChronoUnit.DAYS.between(bookingDate, departureTime);

        if (daysUntilDeparture >= 30) {
            // Early bird: -15%
            BigDecimal discount = price.multiply(new BigDecimal("0.15"));
            return price.subtract(discount);
        } else if (daysUntilDeparture <= 7) {
            // Last minute: +25%
            BigDecimal surcharge = price.multiply(new BigDecimal("0.25"));
            return price.add(surcharge);
        }

        // Normál ár (8-29 nap között)
        return price;
    }

    /**
     * Szezonális felár
     * Június-augusztus: +20%
     */
    private BigDecimal applySeasonalSurcharge(BigDecimal price, @NonNull LocalDateTime departureTime) {
        int month = departureTime.getMonthValue();

        // Június (6), Július (7), Augusztus (8)
        if (month >= 6 && month <= 8) {
            BigDecimal surcharge = price.multiply(new BigDecimal("0.20"));
            return price.add(surcharge);
        }

        return price;
    }
}