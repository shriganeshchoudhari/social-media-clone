package com.example.social.exception;

public class ContentViolationException extends RuntimeException {
    public ContentViolationException(String message) {
        super(message);
    }
}
