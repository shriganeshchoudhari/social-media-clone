package com.example.social.chat.dto;

import java.util.List;

public record CreateGroupRequest(
        String name,
        List<String> participants) {
}
