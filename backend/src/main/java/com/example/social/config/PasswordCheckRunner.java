package com.example.social.config;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class PasswordCheckRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner debugPassword() {
        return args -> {
            String testUsername = "diana_p";
            String plainPassword = "admin123";

            System.out.println("\n\n=============================================");
            System.out.println(" DIAGNOSTIC PASSWORD CHECKER");
            System.out.println("=============================================");

            Optional<User> userOpt = userRepository.findByUsername(testUsername);
            if (userOpt.isEmpty()) {
                System.out.println("❌ User '" + testUsername + "' NOT FOUND in database!");
                return;
            }

            User user = userOpt.get();
            System.out.println("User found: " + user.getUsername());
            System.out.println("DB Password Hash: " + user.getPassword());
            System.out.println("Testing against plain text: '" + plainPassword + "'");

            boolean matches = passwordEncoder.matches(plainPassword, user.getPassword());
            System.out.println("MATCH RESULT: " + (matches ? "✅ SUCCESS" : "❌ FAILED"));

            if (!matches) {
                String newHash = passwordEncoder.encode(plainPassword);
                System.out.println("Expected Hash for '" + plainPassword + "' should look like: " + newHash);

                // Force update to fix it
                System.out.println("Usage Hint: Run this SQL to fix it manually if needed:");
                System.out.println(
                        "UPDATE users SET password = '" + newHash + "' WHERE username = '" + testUsername + "';");
            }

            System.out.println("=============================================\n\n");
        };
    }
}
