package com.reservite.hotelservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * Configuration CORS pour autoriser les requêtes du frontend
 * 
 * CHANGEMENT: Supprimé setAllowCredentials(true) car le frontend n'envoie plus
 * de credentials. L'authentification se fait via le header Authorization.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // ❌ REMOVED: config.setAllowCredentials(true);
        // Le frontend n'envoie plus withCredentials:true
        // L'auth se fait via header Authorization avec le token JWT
        
        config.addAllowedOrigin("http://localhost:5173");  // Frontend Vite
        config.addAllowedOrigin("http://localhost:9000");  // API Gateway (si besoin)
        config.addAllowedOrigin("http://localhost:3000");  // Autres frontends potentiels
        
        config.addAllowedHeader("*");                      // Tous les headers
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");                // Important pour preflight

        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
