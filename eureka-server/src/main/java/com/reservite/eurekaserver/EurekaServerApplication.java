package com.reservite.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Server - Service Discovery
 * Point central d'enregistrement pour tous les microservices
 * Console disponible à : http://localhost:8761
 */
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
        System.out.println("╔════════════════════════════════════════╗");
        System.out.println("║   📡 EUREKA SERVER DÉMARRÉ            ║");
        System.out.println("║   URL: http://localhost:8761          ║");
        System.out.println("║   Dashboard: http://localhost:8761    ║");
        System.out.println("╚════════════════════════════════════════╝");
    }
}