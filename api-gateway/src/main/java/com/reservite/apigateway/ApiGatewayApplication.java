package com.reservite.apigateway;  // ← PACKAGE CORRIGÉ !

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway - Point d'entrée unique pour tous les microservices
 * Port : 9000
 * Toutes les requêtes passent par cette gateway qui route vers les services appropriés
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
        System.out.println("╔════════════════════════════════════════╗");
        System.out.println("║   🌐 API GATEWAY DÉMARRÉ              ║");
        System.out.println("║   URL: http://localhost:9000          ║");
        System.out.println("║   Eureka: http://localhost:8761       ║");
        System.out.println("╚════════════════════════════════════════╝");
    }
}