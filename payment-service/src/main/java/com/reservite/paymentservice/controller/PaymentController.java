package com.reservite.paymentservice.controller;

import com.reservite.paymentservice.dto.CreatePaymentRequest;
import com.reservite.paymentservice.entity.Payment;
import com.reservite.paymentservice.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:9000",
        "http://localhost:8080"
})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Payment Service is running! 🚀");
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentRequest request) {
        System.out.println("📥 Received payment request: " + request);
        try {
            Payment payment = paymentService.processPayment(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement effectué avec succès");
            response.put("paymentId", payment.getId());
            response.put("transactionId", payment.getTransactionId());
            response.put("status", payment.getStatus());
            response.put("amount", payment.getAmount());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Payment validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            System.err.println("❌ Payment error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur lors du paiement: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            Payment payment = paymentService.getPaymentById(id);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<?> getPaymentByReservation(@PathVariable Long reservationId) {
        try {
            Payment payment = paymentService.getPaymentByReservationId(reservationId);
            return ResponseEntity.ok(payment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Long id) {
        try {
            Payment payment = paymentService.refundPayment(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Paiement remboursé avec succès",
                    "paymentId", payment.getId(),
                    "status", payment.getStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}