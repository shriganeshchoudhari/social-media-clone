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
    private Long viewCount;
    private PollResponse poll;

    public static StoryResponse fromEntity(Story story) {
        return fromEntity(story, null);
    }

    public static StoryResponse fromEntity(Story story, Long userVotedOptionId) {
        User user = story.getUser();

        PollResponse pollResponse = null;
        if (story.getPoll() != null) {
            pollResponse = PollResponse.builder()
                    .id(story.getPoll().getId())
                    .question(story.getPoll().getQuestion())
                    .options(story.getPoll().getOptions().stream()
                            .map(opt -> PollOptionResponse.builder()
                                    .id(opt.getId())
                                    .text(opt.getText())
                                    .voteCount(opt.getVoteCount())
                                    .build())
                            .collect(java.util.stream.Collectors.toList()))
                    .userVotedOptionId(userVotedOptionId)
                    .build();
        }

        return StoryResponse.builder()
                .id(story.getId())
                .imageUrl(story.getImageUrl())
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .userId(user.getId())
                .username(user.getUsername())
                .userProfileImage(user.getProfileImageUrl())
                .viewCount(story.getViewCount())
                .poll(pollResponse)
                .build();
    }

    @Data
    @Builder
    public static class PollResponse {
        private Long id;
        private String question;
        private java.util.List<PollOptionResponse> options;
        private Long userVotedOptionId;
    }

    @Data
    @Builder
    public static class PollOptionResponse {
        private Long id;
        private String text;
        private long voteCount;
    }
}
