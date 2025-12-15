package com.reservite.userservice.service;

import com.reservite.userservice.dto.LoginRequest;
import com.reservite.userservice.dto.RegisterRequest;
import com.reservite.userservice.entity.User;
import com.reservite.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> register(RegisterRequest request) {
        System.out.println("📝 Registering new user: " + request.getEmail());

        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }

        // Créer l'utilisateur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("USER");
        user.setActive(true);

        User savedUser = userRepository.save(user);
        System.out.println("✅ User registered successfully: " + savedUser.getEmail());

        // Générer un token simple
        String token = "token-" + savedUser.getId() + "-" + System.currentTimeMillis();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Inscription réussie");
        response.put("token", token);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", savedUser.getId());
        userMap.put("email", savedUser.getEmail());
        userMap.put("firstName", savedUser.getFirstName());
        userMap.put("lastName", savedUser.getLastName());
        userMap.put("username", savedUser.getFullName());

        response.put("user", userMap);

        return response;
    }

    public Map<String, Object> login(LoginRequest request) {
        System.out.println("🔑 Login attempt for: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        if (!user.getActive()) {
            throw new IllegalArgumentException("Compte désactivé");
        }

        System.out.println("✅ Login successful for: " + user.getEmail());

        // Générer un token simple
        String token = "token-" + user.getId() + "-" + System.currentTimeMillis();

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Connexion réussie");
        response.put("token", token);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("username", user.getFullName());
        userMap.put("phoneNumber", user.getPhoneNumber());

        response.put("user", userMap);

        return response;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
    }
}