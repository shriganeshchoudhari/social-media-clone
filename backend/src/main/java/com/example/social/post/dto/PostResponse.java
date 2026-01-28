package com.example.social.post.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
                Long id,
                String content,
                String authorUsername,
                List<String> images,
                LocalDateTime createdAt,
                Long likeCount,
                boolean likedByMe) {
}
