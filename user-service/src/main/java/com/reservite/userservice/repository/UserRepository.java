package com.reservite.userservice.repository;

import com.reservite.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    // SUPPRIMÉ: findByUsername - pas de champ username dans l'entité

    boolean existsByEmail(String email);
    // SUPPRIMÉ: existsByUsername - pas de champ username dans l'entité
}