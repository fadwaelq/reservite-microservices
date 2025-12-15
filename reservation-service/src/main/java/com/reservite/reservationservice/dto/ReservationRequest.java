// src/main/java/com/reservite/reservationservice/dto/ReservationRequest.java
package com.reservite.reservationservice.dto;

import java.time.LocalDate;

/**
 * DTO pour créer une réservation
 * Version SANS validation Jakarta (aucune dépendance nécessaire)
 */
public record ReservationRequest(

        Long userId,

        Long hotelId,

        Long roomId, // optionnel

        LocalDate checkIn,

        LocalDate checkOut

) {
    // Tu peux ajouter une petite validation manuelle si tu veux (bonus propreté)
    public ReservationRequest {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("userId est obligatoire et doit être positif");
        }
        if (hotelId == null || hotelId <= 0) {
            throw new IllegalArgumentException("hotelId est obligatoire et doit être positif");
        }
        if (checkIn == null) {
            throw new IllegalArgumentException("checkIn est obligatoire");
        }
        if (checkOut == null) {
            throw new IllegalArgumentException("checkOut est obligatoire");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("La date de départ doit être après la date d'arrivée");
        }
    }
}