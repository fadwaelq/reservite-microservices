package com.reservite.reservationservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        System.out.println("✅ DataInitializer : Reservation Service démarré avec succès");
    }
}