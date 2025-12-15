package com.reservite.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur de fallback pour gérer les erreurs de circuit breaker
 * Retourne des messages d'erreur gracieux quand un service est indisponible
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> userFallback() {
        return buildFallbackResponse("User Service", "Le service utilisateur est temporairement indisponible");
    }

    @GetMapping("/hotel")
    public ResponseEntity<Map<String, Object>> hotelFallback() {
        return buildFallbackResponse("Hotel Service", "Le service hôtel est temporairement indisponible");
    }

    @GetMapping("/reservation")
    public ResponseEntity<Map<String, Object>> reservationFallback() {
        return buildFallbackResponse("Reservation Service", "Le service de réservation est temporairement indisponible");
    }

    @GetMapping("/payment")
    public ResponseEntity<Map<String, Object>> paymentFallback() {
        return buildFallbackResponse("Payment Service", "Le service de paiement est temporairement indisponible");
    }

    private ResponseEntity<Map<String, Object>> buildFallbackResponse(String service, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SERVICE_UNAVAILABLE");
        response.put("service", service);
        response.put("message", message);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
