package com.example.social.group.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GroupRequest(
        @JsonProperty("name") String name,
        @JsonProperty("description") String description,
        @JsonProperty("rules") String rules,
        @JsonProperty("privacy") String privacy // "PUBLIC" or "PRIVATE"
) {
}
