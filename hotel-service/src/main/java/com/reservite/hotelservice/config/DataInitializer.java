package com.reservite.hotelservice.config;

import com.reservite.hotelservice.entity.Hotel;
import com.reservite.hotelservice.entity.Room;
import com.reservite.hotelservice.repository.HotelRepository;
import com.reservite.hotelservice.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public DataInitializer(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        // Nettoie tout à chaque démarrage (pour être sûr pendant les tests)
        roomRepository.deleteAll();
        hotelRepository.deleteAll();

        System.out.println("Création des données de test pour hotel-service...");

        // ===== Hôtel 1 (id = 1) =====
        Hotel hotel1 = new Hotel();
        hotel1.setId(1L);
        hotel1.setName("Hotel Royal Casablanca");
        hotel1.setAddress("123 Boulevard de la Corniche");
        hotel1.setCity("Casablanca");
        hotel1.setCountry("Maroc");
        hotel1.setRating(4.5);
        hotel1.setEmail("contact@royalcasablanca.ma");
        hotel1.setPhone("+212 522 123 456");
        hotel1.setLocation("33.5731° N, 7.5898° W");
        hotel1.setDescription("Hôtel de luxe situé sur la corniche de Casablanca avec vue sur l'océan Atlantique");
        hotel1 = hotelRepository.save(hotel1);

        // ===== Hôtel 2 (id = 2) =====
        Hotel hotel2 = new Hotel();
        hotel2.setId(2L);
        hotel2.setName("Hotel Riad Marrakech");
        hotel2.setAddress("456 Rue de la Médina");
        hotel2.setCity("Marrakech");
        hotel2.setCountry("Maroc");
        hotel2.setRating(4.2);
        hotel2.setEmail("info@riadmarrakech.ma");
        hotel2.setPhone("+212 524 987 654");
        hotel2.setLocation("31.6295° N, 7.9811° W");
        hotel2.setDescription("Riad authentique au cœur de la médina de Marrakech");
        hotel2 = hotelRepository.save(hotel2);

        // ===== Chambres hôtel 1 =====
        createRoom(hotel1, "101", "SINGLE", 150.0, 1, true);
        createRoom(hotel1, "102", "DOUBLE", 250.0, 2, true);
        createRoom(hotel1, "103", "SUITE", 500.0, 4, true);

        // ===== Chambres hôtel 2 =====
        createRoom(hotel2, "201", "DOUBLE", 200.0, 2, true);
        createRoom(hotel2, "202", "SUITE", 400.0, 3, false);

        System.out.println("Données de test créées avec succès ! Hôtel id=1 et id=2 disponibles.");
    }

    private void createRoom(Hotel hotel, String number, String type, double price, int capacity, boolean available) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(number);
        room.setType(type);
        room.setPrice(price);
        room.setCapacity(capacity);
        room.setAvailable(available);
        roomRepository.save(room);
    }
}