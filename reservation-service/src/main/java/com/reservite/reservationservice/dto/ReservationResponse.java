package com.reservite.reservationservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservationResponse(
        Long id,
        Long userId,
        Long hotelId,
        Long roomId,
        LocalDate checkIn,
        LocalDate checkOut,
        Double totalPrice,
        String status,
        String paymentStatus,
        LocalDateTime paymentDate,
        LocalDateTime createdAt
) {}