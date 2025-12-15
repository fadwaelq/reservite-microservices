package com.reservite.hotelservice.service;

import com.reservite.hotelservice.dto.HotelDTO;
import java.util.List;

public interface HotelService {

    List<HotelDTO> getAllHotels();

    HotelDTO getHotelById(Long id);

    HotelDTO createHotel(HotelDTO hotelDTO);

    HotelDTO updateHotel(Long id, HotelDTO hotelDTO);

    boolean deleteHotel(Long id);

    boolean deleteRoom(Long roomId);
}