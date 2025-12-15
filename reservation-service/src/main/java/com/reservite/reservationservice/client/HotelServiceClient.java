package com.reservite.reservationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "hotel-service", url = "http://localhost:8084")
public interface HotelServiceClient {

    @GetMapping("/api/hotels/{id}")
    Map<String, Object> getHotel(@PathVariable("id") Long id);

    @GetMapping("/api/hotels/{hotelId}/rooms/{roomId}")
    Map<String, Object> getRoom(@PathVariable("hotelId") Long hotelId,
                                @PathVariable("roomId") Long roomId);

    @GetMapping("/api/hotels/{hotelId}/rooms/{roomId}")
    Map<String, Object> getRoomDetails(@PathVariable("hotelId") Long hotelId,
                                       @PathVariable("roomId") Long roomId);

    @PutMapping("/api/hotels/{hotelId}/rooms/{roomId}/availability")
    void updateRoomAvailability(@PathVariable("hotelId") Long hotelId,
                                @PathVariable("roomId") Long roomId,
                                @RequestBody Map<String, Boolean> availability);
}