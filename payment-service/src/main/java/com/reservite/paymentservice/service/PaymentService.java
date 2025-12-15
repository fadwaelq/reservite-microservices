package com.reservite.paymentservice.service;

import com.reservite.paymentservice.dto.CreatePaymentRequest;
import com.reservite.paymentservice.dto.CreatePaymentResponse;
import com.reservite.paymentservice.entity.Payment;
import com.reservite.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    /**
     * Traiter un paiement
     */
    public Payment processPayment(CreatePaymentRequest request) {
        System.out.println("💳 Processing payment for reservation: " + request.getReservationId());

        // Validation
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Le montant doit être supérieur à 0");
        }

        if (request.getReservationId() == null) {
            throw new IllegalArgumentException("L'ID de réservation est requis");
        }

        // Vérifier si un paiement existe déjà pour cette réservation
        paymentRepository.findByReservationId(request.getReservationId())
                .ifPresent(p -> {
                    throw new IllegalArgumentException("Un paiement existe déjà pour cette réservation");
                });

        // Créer le paiement
        Payment payment = new Payment();
        payment.setReservationId(request.getReservationId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CREDIT_CARD");

        // Masquer le numéro de carte (garder seulement les 4 derniers chiffres)
        if (request.getCardNumber() != null && request.getCardNumber().length() >= 4) {
            String maskedCard = "**** **** **** " +
                    request.getCardNumber().substring(request.getCardNumber().length() - 4);
            payment.setCardNumber(maskedCard);
        }

        payment.setCardHolderName(request.getCardHolderName());
        payment.setExpiryDate(request.getExpiryDate());

        // Simuler le traitement du paiement
        // En production, vous intégreriez ici Stripe, PayPal, etc.
        boolean paymentSuccessful = simulatePaymentProcessing(request);

        if (paymentSuccessful) {
            payment.setStatus("COMPLETED");
            System.out.println("✅ Payment completed successfully");
        } else {
            payment.setStatus("FAILED");
            System.out.println("❌ Payment failed");
        }

        return paymentRepository.save(payment);
    }

    /**
     * Récupérer un paiement par ID
     */
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Paiement non trouvé"));
    }

    /**
     * Récupérer un paiement par ID de réservation
     */
    public Payment getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Aucun paiement trouvé pour cette réservation"));
    }

    /**
     * Simuler le traitement du paiement
     * En production : intégration avec Stripe, PayPal, etc.
     */
    private boolean simulatePaymentProcessing(CreatePaymentRequest request ) {
        // Validation basique de la carte
        if (request.getCardNumber() == null || request.getCardNumber().length() < 13) {
            return false;
        }

        if (request.getCvv() == null || request.getCvv().length() != 3) {
            return false;
        }

        // Simuler un délai de traitement
        try {
            Thread.sleep(1000); // 1 seconde
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Simuler un taux de succès de 95%
        return Math.random() > 0.05;
    }

    /**
     * Rembourser un paiement
     */
    public Payment refundPayment(Long paymentId) {
        Payment payment = getPaymentById(paymentId);

        if (!"COMPLETED".equals(payment.getStatus())) {
            throw new IllegalArgumentException("Seuls les paiements complétés peuvent être remboursés");
        }

        payment.setStatus("REFUNDED");
        System.out.println("💸 Payment refunded: " + paymentId);

        return paymentRepository.save(payment);
    }
}