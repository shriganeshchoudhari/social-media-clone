package com.example.social.poll.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PollResponse(
        Long id,
        String question,
        List<PollOptionResponse> options,
        LocalDateTime expiryDateTime,
        boolean isClosed,
        Long totalVotes,
        Long userVotedOptionId // ID of the option the current user voted for, or null
) {
}
