// src/main/java/com/reservite/reservationservice/repository/ReservationRepository.java
package com.reservite.reservationservice.repository;

import com.reservite.reservationservice.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
}