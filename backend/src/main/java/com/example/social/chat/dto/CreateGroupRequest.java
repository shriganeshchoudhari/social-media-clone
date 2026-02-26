package com.example.social.chat.dto;

import java.util.List;

public record CreateGroupRequest(
                String name,
                String description,
                String rules,
                boolean isPublic,
                List<String> participants) {
}
