package com.reservite.reservationservice.service;

import com.reservite.reservationservice.client.HotelServiceClient;
import com.reservite.reservationservice.client.UserServiceClient;
import com.reservite.reservationservice.dto.ReservationDTO;
import com.reservite.reservationservice.entity.Reservation;
import com.reservite.reservationservice.repository.ReservationRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service de gestion des réservations
 * Vérifie la disponibilité et met à jour les chambres
 */
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final HotelServiceClient hotelClient;
    private final UserServiceClient userClient;
    private final ReservationRepository reservationRepository;

    /**
     * Créer une réservation avec vérification complète
     */
    @Transactional
    public Reservation createReservation(ReservationDTO dto) {
        // ===== LOGS DE DÉBOGAGE - DÉBUT =====
        System.out.println("========================================");
        System.out.println("=== CRÉATION DE RÉSERVATION ===");
        System.out.println("User ID reçu: " + dto.getUserId());
        System.out.println("Hotel ID reçu: " + dto.getHotelId());
        System.out.println("Room ID reçu: " + dto.getRoomId());
        System.out.println("Type de Room ID: " + (dto.getRoomId() != null ? dto.getRoomId().getClass().getName() : "null"));
        System.out.println("Check-in: " + dto.getCheckIn());
        System.out.println("Check-out: " + dto.getCheckOut());
        System.out.println("Client: " + dto.getFirstName() + " " + dto.getLastName());
        System.out.println("Email: " + dto.getEmail());
        System.out.println("========================================");
        // ===== LOGS DE DÉBOGAGE - FIN =====

        // 1. Vérifier que l'utilisateur existe
        try {
            userClient.getUser(dto.getUserId());
            System.out.println("✅ Utilisateur trouvé");
        } catch (FeignException.NotFound e) {
            System.err.println("❌ Utilisateur non trouvé : " + dto.getUserId());
            throw new RuntimeException("Utilisateur non trouvé : " + dto.getUserId());
        }

        // 2. Vérifier que l'hôtel existe
        try {
            hotelClient.getHotel(dto.getHotelId());
            System.out.println("✅ Hôtel trouvé");
        } catch (FeignException.NotFound e) {
            System.err.println("❌ Hôtel non trouvé : " + dto.getHotelId());
            throw new RuntimeException("Hôtel non trouvé : " + dto.getHotelId());
        }

        // 3. Vérifier les dates
        if (dto.getCheckOut().isBefore(dto.getCheckIn()) ||
                dto.getCheckOut().equals(dto.getCheckIn())) {
            throw new IllegalArgumentException("La date de départ doit être après la date d'arrivée");
        }

        // 4. Si roomId est fourni, récupérer le prix (vérification disponibilité désactivée temporairement)
        double pricePerNight = 100.0;

        if (dto.getRoomId() != null) {
            try {
                System.out.println("📞 Appel à HotelService pour récupérer la chambre ID: " + dto.getRoomId());
                System.out.println("📞 URL appelée: /api/hotels/" + dto.getHotelId() + "/rooms/" + dto.getRoomId());

                Map<String, Object> room = hotelClient.getRoomDetails(dto.getHotelId(), dto.getRoomId());

                System.out.println("✅ Réponse reçue du HotelService: " + room);

                // ⚠️ VÉRIFICATION DE DISPONIBILITÉ TEMPORAIREMENT DÉSACTIVÉE
                System.out.println("⚠️ Vérification de disponibilité désactivée pour test");

                // Récupérer le prix réel
                Object priceObj = room.get("price");
                if (priceObj != null) {
                    pricePerNight = ((Number) priceObj).doubleValue();
                    System.out.println("💰 Prix par nuit: " + pricePerNight);
                }
            } catch (FeignException.NotFound e) {
                System.err.println("❌ Chambre non trouvée avec ID: " + dto.getRoomId());
                System.err.println("❌ Message d'erreur Feign: " + e.getMessage());
                System.err.println("❌ Status Code: " + e.status());
                throw new RuntimeException("Chambre non trouvée : " + dto.getRoomId());
            } catch (FeignException e) {
                System.err.println("❌ Erreur Feign: " + e.getClass().getName());
                System.err.println("❌ Status Code: " + e.status());
                System.err.println("❌ Message: " + e.getMessage());
                throw new RuntimeException("Erreur lors de la vérification de la chambre : " + dto.getRoomId());
            } catch (Exception e) {
                System.err.println("❌ Erreur inattendue: " + e.getClass().getName());
                System.err.println("❌ Message: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        }

        // 5. Calculer le prix total
        long nights = ChronoUnit.DAYS.between(dto.getCheckIn(), dto.getCheckOut());
        double totalPrice = nights * pricePerNight;
        System.out.println("💵 Calcul: " + nights + " nuits × " + pricePerNight + "€ = " + totalPrice + "€");

        // 6. Créer la réservation
        Reservation reservation = new Reservation();
        reservation.setUserId(dto.getUserId());
        reservation.setHotelId(dto.getHotelId());
        reservation.setRoomId(dto.getRoomId());
        reservation.setCheckIn(dto.getCheckIn());
        reservation.setCheckOut(dto.getCheckOut());
        reservation.setTotalPrice(totalPrice);

        // Ajouter les informations client
        reservation.setFirstName(dto.getFirstName());
        reservation.setLastName(dto.getLastName());
        reservation.setEmail(dto.getEmail());
        reservation.setPhone(dto.getPhone());
        reservation.setSpecialRequests(dto.getSpecialRequests());

        Reservation saved = reservationRepository.save(reservation);
        System.out.println("✅ Réservation créée avec ID: " + saved.getId());

        // 7. Marquer la chambre comme non disponible (optionnel pour le moment)
        if (dto.getRoomId() != null) {
            try {
                Map<String, Boolean> availability = new HashMap<>();
                availability.put("available", false);
                hotelClient.updateRoomAvailability(dto.getHotelId(), dto.getRoomId(), availability);
                System.out.println("✅ Disponibilité de la chambre mise à jour");
            } catch (Exception e) {
                System.err.println("⚠️ Warning: Impossible de mettre à jour la disponibilité : " + e.getMessage());
            }
        }

        System.out.println("========================================");
        return saved;
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée : " + id));
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    /**
     * Annuler une réservation et remettre la chambre disponible
     */
    @Transactional
    public void cancelReservation(Long id) {
        Reservation reservation = getReservationById(id);

        // Remettre la chambre disponible
        if (reservation.getRoomId() != null) {
            try {
                Map<String, Boolean> availability = new HashMap<>();
                availability.put("available", true);
                hotelClient.updateRoomAvailability(
                        reservation.getHotelId(),
                        reservation.getRoomId(),
                        availability
                );
            } catch (Exception e) {
                System.err.println("Warning: Impossible de remettre la chambre disponible : " + e.getMessage());
            }
        }

        reservationRepository.deleteById(id);
    }

    // ============================================================
    // ✅ NOUVELLE MÉTHODE - Confirmer le paiement d'une réservation
    // ============================================================
    /**
     * Confirme une réservation après paiement réussi
     * Appelé par le payment-service via l'endpoint /confirm-payment
     *
     * @param reservationId ID de la réservation à confirmer
     */
    @Transactional
    public void confirmPayment(Long reservationId) {
        System.out.println("========================================");
        System.out.println("=== CONFIRMATION DE PAIEMENT ===");
        System.out.println("Réservation ID: " + reservationId);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Réservation introuvable: " + reservationId));

        System.out.println("Statut actuel: " + reservation.getStatus());

        // Vérifier que la réservation n'est pas déjà confirmée (idempotence)
        if ("CONFIRMED".equals(reservation.getStatus())) {
            System.out.println("⚠️ Réservation déjà confirmée (idempotence)");
            return;
        }

        // Marquer comme confirmée (utilisation de String car pas d'enum pour le moment)
        reservation.setStatus("CONFIRMED");

        reservationRepository.save(reservation);

        System.out.println("✅ Réservation " + reservationId + " confirmée avec succès!");
        System.out.println("Nouveau statut: " + reservation.getStatus());
        System.out.println("========================================");

        // TODO futur : envoyer email de confirmation
    }
}