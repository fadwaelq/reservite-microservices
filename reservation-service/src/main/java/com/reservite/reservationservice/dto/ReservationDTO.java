package com.reservite.reservationservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {

    private Long userId;
    private Long hotelId;
    private Long roomId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkIn;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOut;

    // Informations client
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String specialRequests;

    // Champs supplémentaires
    private Integer numberOfGuests;
    private Double totalPrice;
    private String status;

    // Alias pour compatibilité (optionnel)
    public LocalDate getCheckInDate() {
        return checkIn;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkIn = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOut;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOut = checkOutDate;
    }

    public String getUserName() {
        return firstName != null && lastName != null
                ? firstName + " " + lastName
                : null;
    }

    public String getUserEmail() {
        return email;
    }

    @Override
    public String toString() {
        return "ReservationDTO{" +
                "userId=" + userId +
                ", hotelId=" + hotelId +
                ", roomId=" + roomId +
                ", checkIn=" + checkIn +
                ", checkOut=" + checkOut +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", numberOfGuests=" + numberOfGuests +
                ", totalPrice=" + totalPrice +
                ", specialRequests='" + specialRequests + '\'' +
                '}';
    }
}