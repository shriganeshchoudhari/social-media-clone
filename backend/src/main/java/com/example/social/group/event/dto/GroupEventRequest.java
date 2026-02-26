package com.example.social.group.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record GroupEventRequest(
        String title,
        String description,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm") LocalDateTime startTime,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm") LocalDateTime endTime,
        String location) {
}
