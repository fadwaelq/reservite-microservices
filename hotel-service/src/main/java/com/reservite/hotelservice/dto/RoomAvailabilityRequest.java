package com.reservite.hotelservice.dto;

public class RoomAvailabilityRequest {
    private boolean available;

    // Constructors
    public RoomAvailabilityRequest() {}

    public RoomAvailabilityRequest(boolean available) {
        this.available = available;
    }

    // Getters and Setters
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}