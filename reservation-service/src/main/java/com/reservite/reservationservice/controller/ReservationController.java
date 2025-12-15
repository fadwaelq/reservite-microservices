package com.reservite.reservationservice.controller;
import com.reservite.reservationservice.dto.ReservationDTO;
import com.reservite.reservationservice.entity.Reservation;
import com.reservite.reservationservice.service.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
/**
 * Contrôleur REST pour la gestion des réservations
 */
@Slf4j
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:9000"})
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;
    /**
     * Créer une nouvelle réservation
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReservationDTO dto) {
        log.info("📥 Received reservation request: {}", dto);
        try {
            // Validation basique
            if (dto.getRoomId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Room ID is required"
                ));
            }
            if (dto.getCheckInDate() == null || dto.getCheckOutDate() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Check-in and check-out dates are required"
                ));
            }
            Reservation reservation = reservationService.createReservation(dto);
            log.info("✅ Reservation created successfully: {}", reservation.getId());
            // Réponse structurée
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Réservation confirmée");
            response.put("id", reservation.getId()); // ← IMPORTANT: Ajouter "id" pour le frontend
            response.put("reservationId", reservation.getId());
            response.put("status", reservation.getStatus());
            response.put("reservation", reservation);
            return ResponseEntity.status(201).body(response);
        } catch (IllegalArgumentException e) {
            log.error("❌ Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error creating reservation: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur lors de la création de la réservation: " + e.getMessage()
            ));
        }
    }
    /**
     * Récupérer toutes les réservations
     */
    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {
        log.info("📋 Fetching all reservations");
        return ResponseEntity.ok(reservationService.getAll());
    }
    /**
     * Récupérer une réservation par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        log.info("🔍 Fetching reservation with ID: {}", id);
        try {
            Reservation reservation = reservationService.getReservationById(id);
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            log.error("❌ Reservation not found: {}", id);
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Réservation non trouvée"
            ));
        }
    }
    /**
     * Récupérer les réservations d'un utilisateur
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable Long userId) {
        log.info("👤 Fetching reservations for user: {}", userId);
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }
    /**
     * Annuler une réservation
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id) {
        log.info("🗑️ Cancelling reservation: {}", id);
        try {
            reservationService.cancelReservation(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Réservation annulée avec succès"
            ));
        } catch (Exception e) {
            log.error("❌ Failed to cancel reservation: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur lors de l'annulation: " + e.getMessage()
            ));
        }
    }
    // ============================================================
    // ✅ NOUVELLE MÉTHODE - Confirmer le paiement d'une réservation
    // ============================================================
    /**
     * Confirme le paiement d'une réservation
     * Appelé par le payment-service après capture réussie du paiement PayPal
     *
     * @param id ID de la réservation
     * @return 200 OK si succès
     */
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        log.info("💳 Confirmation de paiement pour réservation: {}", id);
        try {
            reservationService.confirmPayment(id);
            log.info("✅ Paiement confirmé pour réservation {}", id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Paiement confirmé"
            ));
        } catch (IllegalArgumentException e) {
            log.error("❌ Réservation non trouvée: {}", id);
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Réservation non trouvée"
            ));
        } catch (Exception e) {
            log.error("❌ Erreur lors de la confirmation: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur lors de la confirmation du paiement"
            ));
        }
    }
}
