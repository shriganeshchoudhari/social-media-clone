package com.example.social.story;

import com.example.social.user.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StoryResponse {
    private Long id;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Long userId;
    private String username;
    private String userProfileImage;
    private long viewCount;

    public static StoryResponse fromEntity(Story story) {
        User user = story.getUser();
        return StoryResponse.builder()
                .id(story.getId())
                .imageUrl(story.getImageUrl())
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .userId(user.getId())
                .username(user.getUsername())
                .userProfileImage(user.getProfileImageUrl())
                .viewCount(story.getViewCount())
                .build();
    }
}
