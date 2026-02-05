package com.example.social.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handle(RuntimeException ex) {
        ex.printStackTrace();
        String error = ex.getMessage() != null ? ex.getMessage() : "Unknown error";
        String cause = ex.getCause() != null ? ex.getCause().toString() : "No cause";
        return ResponseEntity.badRequest().body(
                Map.of("error", error, "exception", ex.getClass().getName(), "cause", cause));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        return ResponseEntity.status(500).body(
                Map.of("error", "Internal server error"));
    }
}
