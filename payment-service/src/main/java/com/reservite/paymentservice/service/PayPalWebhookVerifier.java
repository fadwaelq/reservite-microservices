// src/main/java/com/reservite/paymentservice/service/PayPalWebhookVerifier.java

package com.reservite.paymentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PayPalWebhookVerifier {

    // En dev/local → on désactive la vérif pour éviter les erreurs
    // En prod → tu remettras la vraie vérification (je te la donne après)
    public boolean verify(String transmissionId,
                          String timestamp,
                          String body,
                          String signature,
                          String certUrl,
                          String authAlgo) {

        // VERSION DEV : on accepte tout (OK en local/H2)
        System.out.println("⚠️ Webhook verification SKIPPED in development mode");
        return true;

        // VERSION PROD (à décommenter plus tard) :
        /*
        if (!"sandbox".equals(payPalConfig.getMode())) {
            // → Implémentation complète ici :
            // https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
            return verifySignatureWithPayPalSpecs(...);
        }
        return true;
        */
    }
}