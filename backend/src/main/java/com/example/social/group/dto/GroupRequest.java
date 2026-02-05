package com.example.social.group.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GroupRequest(
                @JsonProperty("name") String name,
                @JsonProperty("description") String description,
                @JsonProperty("privacy") String privacy // "PUBLIC" or "PRIVATE"
) {
}
