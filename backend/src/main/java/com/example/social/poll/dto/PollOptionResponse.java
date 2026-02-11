package com.example.social.poll.dto;

public record PollOptionResponse(
        Long id,
        String text,
        long voteCount,
        double percentage) {
}
