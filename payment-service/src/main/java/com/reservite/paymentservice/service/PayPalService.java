package com.reservite.paymentservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.reservite.paymentservice.config.PayPalConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PayPalService {

    private final PayPalConfig config;
    private final RestTemplate restTemplate = new RestTemplate();

    public String createOrder(Double amount, String returnUrl, String cancelUrl, String idempotencyKey) {
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("PayPal-Request-Id", idempotencyKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = """
            {
              "intent": "CAPTURE",
              "purchase_units": [{
                "amount": {
                  "currency_code": "EUR",
                  "value": "%s"
                }
              }],
              "application_context": {
                "return_url": "%s",
                "cancel_url": "%s",
                "brand_name": "Reservite",
                "user_action": "PAY_NOW",
                "shipping_preference": "NO_SHIPPING"
              }
            }
            """.formatted(String.format("%.2f", amount), returnUrl, cancelUrl);

        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                config.getBaseUrl() + "/v2/checkout/orders",
                HttpMethod.POST,
                entity,
                JsonNode.class
        );

        JsonNode order = response.getBody();
        String orderId = order.get("id").asText();
        String approvalUrl = order.path("links").findValues("href")
                .stream()
                .map(JsonNode::asText)
                .filter(link -> link.contains("approve"))
                .findFirst()
                .orElseThrow();

        return orderId + "|" + approvalUrl;
    }

    public boolean captureOrder(String paypalOrderId) {
        String accessToken = getAccessToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<JsonNode> resp = restTemplate.exchange(
                    config.getBaseUrl() + "/v2/checkout/orders/" + paypalOrderId + "/capture",
                    HttpMethod.POST,
                    entity,
                    JsonNode.class
            );
            return "COMPLETED".equals(resp.getBody().path("status").asText());
        } catch (Exception e) {
            return false;
        }
    }

    private String getAccessToken() {
        String credentials = config.getClientId() + ":" + config.getClientSecret();
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(encoded);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>("grant_type=client_credentials", headers);

        ResponseEntity<JsonNode> resp = restTemplate.postForEntity(
                config.getBaseUrl() + "/v1/oauth2/token",
                entity,
                JsonNode.class
        );
        return resp.getBody().get("access_token").asText();
    }
}
