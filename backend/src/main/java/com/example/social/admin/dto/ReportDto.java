package com.example.social.admin.dto;

import java.time.LocalDateTime;

public record ReportDto(
        Long id,
        String reason,
        Long postId,
        String postContent,
        String reporterUsername,
        LocalDateTime createdAt) {
}
