package com.example.social.user.dto;

public record PasswordChangeRequest(
        String oldPassword,
        String newPassword) {
}
