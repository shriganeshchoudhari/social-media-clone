package com.example.social.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GroupMessageRequest(
        @JsonProperty("content") String content,
        @JsonProperty("voiceUrl") String voiceUrl) {
}
