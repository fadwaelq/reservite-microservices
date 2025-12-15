package com.reservite.hotelservice.dto;

public class RoomAvailabilityResponse {
    private boolean available;
    private String message;

    public RoomAvailabilityResponse() {}  // constructeur par défaut obligatoire

    public RoomAvailabilityResponse(boolean available, String message) {
        this.available = available;
        this.message = message;
    }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

