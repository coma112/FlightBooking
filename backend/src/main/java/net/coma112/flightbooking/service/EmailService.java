package net.coma112.flightbooking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coma112.flightbooking.dto.BookingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@skybooker.hu}")
    private String fromEmail;

    public String generateQrCodeBase64(String bookingReference, String flightNumber) {
        try {
            String qrContent = String.format(
                    "SKYBOOKER:BOOKING:%s:%s",
                    bookingReference,
                    flightNumber != null ? flightNumber : ""
            );

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);

            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 2);

            BitMatrix bitMatrix = qrCodeWriter.encode(qrContent, BarcodeFormat.QR_CODE, 300, 300, hints);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (WriterException | IOException exception) {
            log.error(exception.getMessage(), exception);
            return "";
        }
    }

    public void sendBookingConfirmationEmail(BookingResponse bookings, String paymentMethod) {
        try {
            String qrBase64 = generateQrCodeBase64(bookings.getBookingReference(), bookings.getFlight().getFlightNumber());
            String emailHtml = buildEmailHtml(bookings, qrBase64, paymentMethod);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(bookings.getPassenger().getEmail());
            helper.setSubject("✈\uFE0F SkyBooker - Foglalás visszaigazolás: " + bookings.getBookingReference());
            helper.setText(emailHtml, true);

            mailSender.send(message);
        } catch (MessagingException exception) {
            log.error(exception.getMessage(), exception);
        }
    }

    private String buildEmailHtml(BookingResponse booking, String qrBase64, String paymentMethod) {
        String dep = booking.getFlight().getDepartureAirport().getIataCode();
        String arr = booking.getFlight().getArrivalAirport().getIataCode();
        String depCity = booking.getFlight().getDepartureAirport().getCity();
        String arrCity = booking.getFlight().getArrivalAirport().getCity();
        String flightNum = booking.getFlight().getFlightNumber();
        String ref = booking.getBookingReference();
        String passengerName = booking.getPassenger().getLastName() + " " + booking.getPassenger().getFirstName();
        String price = booking.getTotalPrice().toPlainString();
        String seat = booking.getSeatNumber();
        String payMethod = switch (paymentMethod != null ? paymentMethod : "") {
            case "barion" -> "Barion";
            case "apple_pay" -> "Apple Pay";
            case "google_pay" -> "Google Pay";
            default -> "Bankkártya (Stripe)";
        };

        String qrImg = qrBase64.isEmpty()
                ? "<p style='color:#888'>QR kód nem elérhető</p>"
                : "<img src='data:image/png;base64," + qrBase64 + "' alt='Check-in QR kód' style='width:200px;height:200px;display:block;margin:0 auto;border-radius:8px;' />";

        return """
            <!DOCTYPE html>
            <html lang="hu">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SkyBooker - Foglalás visszaigazolás</title>
            </head>
            <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
                <tr>
                  <td align="center">
                    <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

                      <!-- HEADER -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#0078D4 0%%,#005A9E 100%%);padding:36px 40px;text-align:center;">
                          <p style="margin:0 0 4px 0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:1px;">✈️ SkyBooker</p>
                          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);">Foglalás visszaigazolás</p>
                        </td>
                      </tr>

                      <!-- SUCCESS BANNER -->
                      <tr>
                        <td style="background:#d1fae5;padding:18px 40px;text-align:center;">
                          <p style="margin:0;font-size:20px;font-weight:700;color:#065f46;">✅ Sikeres foglalás és fizetés!</p>
                          <p style="margin:4px 0 0 0;font-size:13px;color:#047857;">Fizetési mód: """ + payMethod + """
                          </p>
                        </td>
                      </tr>

                      <!-- BOOKING REFERENCE -->
                      <tr>
                        <td style="padding:32px 40px 0 40px;text-align:center;">
                          <p style="margin:0 0 6px 0;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Foglalási kód</p>
                          <p style="margin:0;font-size:40px;font-weight:800;color:#0078D4;letter-spacing:6px;">""" + ref + """
                          </p>
                        </td>
                      </tr>

                      <!-- FLIGHT ROUTE -->
                      <tr>
                        <td style="padding:24px 40px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:12px;padding:20px;">
                            <tr>
                              <td style="text-align:center;width:40%%">
                                <p style="margin:0;font-size:32px;font-weight:800;color:#1a1a1a;">""" + dep + """
                                </p>
                                <p style="margin:4px 0 0;font-size:12px;color:#666;">""" + depCity + """
                                </p>
                              </td>
                              <td style="text-align:center;width:20%%">
                                <p style="margin:0;font-size:24px;color:#FF9500;font-weight:800;">→</p>
                                <p style="margin:4px 0 0;font-size:11px;color:#888;font-weight:600;">""" + flightNum + """
                                </p>
                              </td>
                              <td style="text-align:center;width:40%%">
                                <p style="margin:0;font-size:32px;font-weight:800;color:#1a1a1a;">""" + arr + """
                                </p>
                                <p style="margin:4px 0 0;font-size:12px;color:#666;">""" + arrCity + """
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- DETAILS TABLE -->
                      <tr>
                        <td style="padding:0 40px 24px 40px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" style="border:2px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                            <tr style="background:#f8f9fa;">
                              <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#666;text-transform:uppercase;letter-spacing:1px;" colspan="2">Részletek</td>
                            </tr>
                            <tr style="border-top:1px solid #e5e7eb;">
                              <td style="padding:11px 16px;font-size:13px;color:#666;">👤 Utas neve</td>
                              <td style="padding:11px 16px;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">""" + passengerName + """
                              </td>
                            </tr>
                            <tr style="border-top:1px solid #f0f0f0;background:#fafafa;">
                              <td style="padding:11px 16px;font-size:13px;color:#666;">💺 Szék</td>
                              <td style="padding:11px 16px;font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">""" + seat + """
                              </td>
                            </tr>
                            <tr style="border-top:1px solid #e5e7eb;background:#e8f4fd;">
                              <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#1a1a1a;">💳 Végösszeg</td>
                              <td style="padding:14px 16px;font-size:18px;font-weight:800;color:#0078D4;text-align:right;">""" + price + """
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- QR CODE -->
                      <tr>
                        <td style="padding:0 40px 32px 40px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" style="border:2px dashed #0078D4;border-radius:12px;padding:24px;">
                            <tr>
                              <td style="text-align:center;">
                                <p style="margin:0 0 16px 0;font-size:14px;font-weight:700;color:#005A9E;text-transform:uppercase;letter-spacing:1px;">📱 Check-in QR kód</p>
                               \s""" + qrImg + """
                                <p style="margin:12px 0 0;font-size:12px;color:#888;">Mutassa ezt a QR kódot a repülőtéren a check-in pultjainál</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- NOTICE -->
                      <tr>
                        <td style="padding:0 40px 24px 40px;">
                          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:16px;">
                            <tr>
                              <td>
                                <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">⚠️ Fontos információk</p>
                                <p style="margin:0;font-size:12px;color:#78350f;line-height:1.7;">
                                  • Érkezzen legalább 2 órával az indulás előtt a repülőtérre<br>
                                  • Tartsa kéznél az útlevelét és ezt az emailt<br>
                                  • A QR kód a check-in pultjainál szükséges
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                        <td style="background:#1a1a1a;padding:20px 40px;text-align:center;">
                          <p style="margin:0;font-size:12px;color:#666;">© 2026 SkyBooker · info@skybooker.hu · +36 1 234 5678</p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
    }
}
