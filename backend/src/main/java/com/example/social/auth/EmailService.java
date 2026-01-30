package com.example.social.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOTP(String to, String otp, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Password Reset OTP - Social Media App");
            message.setText(String.format(
                    "Hello %s,\n\n" +
                            "Your password reset OTP is: %s\n\n" +
                            "This code will expire in 10 minutes.\n\n" +
                            "If you did not request this password reset, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Social Media App Team",
                    username, otp));
            message.setFrom("noreply@socialmedia.com");

            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + to);
            e.printStackTrace();
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }
}
