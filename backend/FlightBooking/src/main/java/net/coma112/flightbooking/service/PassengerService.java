package net.coma112.flightbooking.service;

import lombok.RequiredArgsConstructor;
import net.coma112.flightbooking.dto.PassengerDTO;
import net.coma112.flightbooking.model.Passenger;
import net.coma112.flightbooking.repository.PassengerRepository;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PassengerService {
    private final PassengerRepository passengerRepository;

    public Passenger createOrUpdatePassenger(@NonNull PassengerDTO dto) {
        Optional<Passenger> existingPassenger = passengerRepository.findByEmail(dto.getEmail());

        if (existingPassenger.isPresent()) {
            Passenger passenger = existingPassenger.get();
            updatePassengerFromDTO(passenger, dto);
            return passengerRepository.save(passenger);
        } else {
            Passenger newPassenger = new Passenger();
            updatePassengerFromDTO(newPassenger, dto);
            return passengerRepository.save(newPassenger);
        }
    }

    public Optional<Passenger> findByEmail(String email) {
        return passengerRepository.findByEmail(email);
    }

    private void updatePassengerFromDTO(@NonNull Passenger passenger, @NonNull PassengerDTO dto) {
        passenger.setFirstName(dto.getFirstName());
        passenger.setLastName(dto.getLastName());
        passenger.setEmail(dto.getEmail());
        passenger.setPhoneNumber(dto.getPhoneNumber());
        passenger.setPassportNumber(dto.getPassportNumber());
        passenger.setDateOfBirth(dto.getDateOfBirth());
    }
}