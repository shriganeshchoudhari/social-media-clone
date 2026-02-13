package com.example.social.call;

public record CallSignal(
        String type,
        String senderUsername,
        String targetUsername,
        String sdp,
        Object candidate) {
}
