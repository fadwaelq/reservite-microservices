package com.reservite.hotelservice.controller;

import com.reservite.hotelservice.dto.HotelDTO;
import com.reservite.hotelservice.dto.RoomAvailabilityRequest;
import com.reservite.hotelservice.entity.Hotel;
import com.reservite.hotelservice.entity.Room;
import com.reservite.hotelservice.repository.HotelRepository;
import com.reservite.hotelservice.repository.RoomRepository;
import com.reservite.hotelservice.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor

public class HotelController {

    private final HotelService hotelService;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    // GET all hotels
    @GetMapping
    public List<HotelDTO> getAllHotels() {
        return hotelService.getAllHotels();
    }

    // GET hotel by ID
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        Optional<Hotel> hotel = hotelRepository.findById(id);
        return hotel.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE new hotel
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel savedHotel = hotelRepository.save(hotel);
        return ResponseEntity.ok(savedHotel);
    }

    // UPDATE hotel
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable Long id, @RequestBody Hotel hotelDetails) {
        Optional<Hotel> hotel = hotelRepository.findById(id);
        if (hotel.isPresent()) {
            Hotel existingHotel = hotel.get();
            existingHotel.setName(hotelDetails.getName());
            existingHotel.setAddress(hotelDetails.getAddress());
            existingHotel.setCity(hotelDetails.getCity());
            existingHotel.setCountry(hotelDetails.getCountry());
            existingHotel.setRating(hotelDetails.getRating());
            Hotel updatedHotel = hotelRepository.save(existingHotel);
            return ResponseEntity.ok(updatedHotel);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE hotel
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        if (hotelRepository.existsById(id)) {
            hotelRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // GET all rooms for a specific hotel
    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getHotelRooms(@PathVariable Long hotelId) {
        Optional<Hotel> hotel = hotelRepository.findById(hotelId);
        if (hotel.isPresent()) {
            return ResponseEntity.ok(hotel.get().getRooms());
        }
        return ResponseEntity.notFound().build();
    }

    // GET available rooms for a hotel
    @GetMapping("/{hotelId}/rooms/available")
    public ResponseEntity<List<Room>> getAvailableRoomsForHotel(@PathVariable Long hotelId) {
        Optional<Hotel> hotel = hotelRepository.findById(hotelId);
        if (hotel.isPresent()) {
            List<Room> availableRooms = roomRepository.findByHotelAndAvailable(hotel.get(), true);
            return ResponseEntity.ok(availableRooms);
        }
        return ResponseEntity.notFound().build();
    }

    // UPDATE room availability
    @PutMapping("/{hotelId}/rooms/{roomId}/availability")
    public ResponseEntity<Room> updateRoomAvailability(
            @PathVariable Long hotelId,
            @PathVariable Long roomId,
            @RequestBody RoomAvailabilityRequest request) {

        Optional<Room> room = roomRepository.findById(roomId);
        if (room.isPresent()) {
            Room existingRoom = room.get();
            existingRoom.setAvailable(request.isAvailable());
            Room updatedRoom = roomRepository.save(existingRoom);
            return ResponseEntity.ok(updatedRoom);
        }
        return ResponseEntity.notFound().build();
    }

    // GET room by ID
    @GetMapping("/{hotelId}/rooms/{roomId}")
    public ResponseEntity<Room> getRoomById(
            @PathVariable Long hotelId,
            @PathVariable Long roomId) {

        Optional<Room> room = roomRepository.findById(roomId);
        return room.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // CREATE new room for a hotel
    @PostMapping("/{hotelId}/rooms")
    public ResponseEntity<Room> createRoom(
            @PathVariable Long hotelId,
            @RequestBody Room room) {

        Optional<Hotel> hotel = hotelRepository.findById(hotelId);
        if (hotel.isPresent()) {
            room.setHotel(hotel.get());
            Room savedRoom = roomRepository.save(room);
            return ResponseEntity.ok(savedRoom);
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE room
    @DeleteMapping("/{hotelId}/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long hotelId,
            @PathVariable Long roomId) {

        if (roomRepository.existsById(roomId)) {
            roomRepository.deleteById(roomId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}