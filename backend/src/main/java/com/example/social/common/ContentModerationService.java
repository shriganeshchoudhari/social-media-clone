package com.example.social.common;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ContentModerationService {

    // Simple in-memory blocklist for now.
    // In a real app, this would load from a database or external config.
    private static final List<String> BANNED_WORDS = Arrays.asList(
            "badword", "offensive", "spam", "scam", "hate", "violence");

    public boolean isContentAllowed(String text) {
        if (text == null || text.isBlank()) {
            return true;
        }
        String lowerCaseText = text.toLowerCase();
        for (String word : BANNED_WORDS) {
            // Simple containment check. regex could be better for whole word matching.
            if (lowerCaseText.contains(word)) {
                return false;
            }
        }
        return true;
    }

    public void validateContent(String text) {
        if (!isContentAllowed(text)) {
            throw new com.example.social.exception.ContentViolationException("Content contains restricted words.");
        }
    }
}
