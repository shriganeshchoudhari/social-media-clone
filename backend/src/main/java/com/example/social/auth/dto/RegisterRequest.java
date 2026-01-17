package com.example.social.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank String username,
        @Email String email,
        @Size(min = 6) String password) {
}
