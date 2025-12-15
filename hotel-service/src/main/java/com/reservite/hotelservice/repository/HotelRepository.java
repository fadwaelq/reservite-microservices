package com.reservite.hotelservice.repository;

import com.reservite.hotelservice.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCity(String city);
    List<Hotel> findByNameContainingIgnoreCase(String name);
    List<Hotel> findByRatingGreaterThanEqual(Double rating);
}
