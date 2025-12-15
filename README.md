# Reservite Microservices

Projet de système de réservation d'hôtels en architecture microservices avec Spring Cloud.

## Microservices
- **eureka-server** : Service de découverte (Eureka)
- **api-gateway** : Passerelle API
- **user-service** : Gestion des utilisateurs
- **hotel-service** : Gestion des hôtels
- **reservation-service** : Gestion des réservations
- **payment-service** : Gestion des paiements

## Comment lancer
1. Lancer Eureka Server
2. Lancer API Gateway
3. Lancer les autres services dans n'importe quel ordre

Utiliser `docker-compose.yml` si disponible, ou lancer chaque module séparément via IntelliJ.
