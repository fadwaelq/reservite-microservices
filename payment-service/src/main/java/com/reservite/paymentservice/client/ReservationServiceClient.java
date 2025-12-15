package com.reservite.paymentservice.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Version SANS Feign → marche direct, zéro dépendance supplémentaire
 */
@Component
@RequiredArgsConstructor
public class ReservationServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${reservation.service.url:http://localhost:8081}")
    private String baseUrl;

    public void confirmPayment(Long reservationId) {
        String url = baseUrl + "/api/reservations/" + reservationId + "/confirm-payment";
        try {
            restTemplate.postForEntity(url, null, Void.class);
            System.out.println("Réservation " + reservationId + " confirmée avec succès !");
        } catch (Exception e) {
            // En dev on ignore juste l'erreur (le service reservation n'existe peut-être pas encore)
            System.err.println("Warning: Impossible de contacter reservation-service : " + e.getMessage());
            // En prod → tu mettras un événement Kafka ou une retry queue
        }
    }
}