package com.reservite.userservice.config;

import com.reservite.userservice.entity.User;
import com.reservite.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("🔧 Initializing default users...");

            // Utilisateur admin
            User admin = new User();
            admin.setEmail("admin@reservite.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("System");
            admin.setPhoneNumber("+212 600 000 000");
            admin.setRole("ADMIN");
            admin.setActive(true);
            userRepository.save(admin);

            // Utilisateur test 1
            User testUser = new User();
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("password123"));
            testUser.setFirstName("John");
            testUser.setLastName("Doe");
            testUser.setPhoneNumber("+212 666 123 456");
            testUser.setRole("USER");
            testUser.setActive(true);
            userRepository.save(testUser);

            // Utilisateur test 2
            User testUser2 = new User();
            testUser2.setEmail("marie@example.com");
            testUser2.setPassword(passwordEncoder.encode("password123"));
            testUser2.setFirstName("Marie");
            testUser2.setLastName("Dupont");
            testUser2.setPhoneNumber("+212 677 654 321");
            testUser2.setRole("USER");
            testUser2.setActive(true);
            userRepository.save(testUser2);

            System.out.println("✅ Default users created successfully");
            System.out.println("   - Admin: admin@reservite.com / admin123");
            System.out.println("   - Test User 1: test@example.com / password123");
            System.out.println("   - Test User 2: marie@example.com / password123");
        } else {
            System.out.println("ℹ️ Users already exist, skipping initialization");
        }
    }
}