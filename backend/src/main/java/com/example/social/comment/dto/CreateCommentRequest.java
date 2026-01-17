package com.example.social.comment.dto;

import jakarta.validation.constraints.*;

public record CreateCommentRequest(
        @NotBlank @Size(max = 300) String content) {
}
