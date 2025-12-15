package com.reservite.hotelservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.reservite.hotelservice.repository.HotelRepository;
import com.reservite.hotelservice.repository.RoomRepository;
import com.reservite.hotelservice.dto.HotelDTO;
import com.reservite.hotelservice.entity.Hotel;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    @Override
    public List<HotelDTO> getAllHotels() {
        return hotelRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public HotelDTO getHotelById(Long id) {
        return hotelRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public HotelDTO createHotel(HotelDTO hotelDTO) {
        Hotel hotel = convertToEntity(hotelDTO);
        Hotel savedHotel = hotelRepository.save(hotel);
        return convertToDTO(savedHotel);
    }

    @Override
    public HotelDTO updateHotel(Long id, HotelDTO hotelDTO) {
        return hotelRepository.findById(id)
                .map(existingHotel -> {
                    existingHotel.setName(hotelDTO.getName());
                    existingHotel.setAddress(hotelDTO.getAddress());
                    existingHotel.setCity(hotelDTO.getCity());
                    existingHotel.setCountry(hotelDTO.getCountry());
                    existingHotel.setRating(hotelDTO.getRating());
                    Hotel updatedHotel = hotelRepository.save(existingHotel);
                    return convertToDTO(updatedHotel);
                })
                .orElse(null);
    }

    @Override
    public boolean deleteHotel(Long id) {
        if (hotelRepository.existsById(id)) {
            hotelRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public boolean deleteRoom(Long roomId) {
        if (roomRepository.existsById(roomId)) {
            roomRepository.deleteById(roomId);
            return true;
        }
        return false;
    }

    private HotelDTO convertToDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setCountry(hotel.getCountry());
        dto.setRating(hotel.getRating());
        return dto;
    }

    private Hotel convertToEntity(HotelDTO dto) {
        Hotel hotel = new Hotel();
        hotel.setName(dto.getName());
        hotel.setAddress(dto.getAddress());
        hotel.setCity(dto.getCity());
        hotel.setCountry(dto.getCountry());
        hotel.setRating(dto.getRating());
        return hotel;
    }
}