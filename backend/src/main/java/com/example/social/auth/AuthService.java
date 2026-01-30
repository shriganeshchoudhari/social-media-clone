package com.example.social.auth;

import com.example.social.auth.dto.*;
import com.example.social.security.JwtService;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already taken");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already taken");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("Login attempt for username: " + request.username());

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + request.username());
                    return new RuntimeException("Invalid credentials");
                });

        System.out.println("User found: " + user.getUsername() + ", checking password...");
        System.out.println("Stored hash: " + user.getPassword());
        System.out.println("Input password length: " + request.password().length());

        boolean matches = passwordEncoder.matches(request.password(), user.getPassword());
        System.out.println("Password matches: " + matches);

        if (!matches) {
            System.out.println("Password mismatch for user: " + request.username());
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        System.out.println("Login successful for: " + request.username());
        return new AuthResponse(token);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save token
        // Invalidate previous tokens? Ideally yes, but for now we just create a new
        // one.
        // Or check if valid one exists. Simpler to just create new.
        resetTokenRepository.deleteByUser(user); // Clean up old tokens first if any (might need Transactional)

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(otp);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        resetTokenRepository.save(token);

        // Send email
        emailService.sendOTP(user.getEmail(), otp, user.getUsername());
    }

    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordResetToken token = resetTokenRepository
                .findByUserAndTokenAndUsedFalse(user, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        // Invalidate all tokens for this user? Or just mark this used.
        // Also tokenVersion increment could be good to invalidate login sessions.
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        token.setUsed(true);
        resetTokenRepository.save(token);

        // Optionally delete all tokens for this user to be clean
        // resetTokenRepository.deleteByUser(user);
    }
}
