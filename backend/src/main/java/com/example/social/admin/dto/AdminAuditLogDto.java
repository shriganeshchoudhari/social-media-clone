package com.example.social.admin.dto;

import java.time.LocalDateTime;

public record AdminAuditLogDto(
        Long id,
        String action,
        String targetUsername,
        String details,
        String adminUsername,
        LocalDateTime createdAt) {
}
