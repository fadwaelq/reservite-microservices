package com.reservite.hotelservice.repository;

import com.reservite.hotelservice.entity.Hotel;
import com.reservite.hotelservice.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByAvailable(boolean available);

    List<Room> findByHotelAndAvailable(Hotel hotel, boolean available);

    List<Room> findByHotel(Hotel hotel);
}