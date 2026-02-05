package com.example.social.group.event;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class GroupEventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private String location;
    private String organizerUsername;
    private Long organizerId;
    private LocalDateTime createdAt;
}
