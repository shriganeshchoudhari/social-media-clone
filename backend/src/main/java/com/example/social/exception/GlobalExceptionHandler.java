package com.example.social.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles NoSuchElementException thrown by Optional.orElseThrow() when an
     * entity is not found in the database. Returns HTTP 404.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNotFound(NoSuchElementException ex) {
        ex.printStackTrace();
        String error = ex.getMessage() != null ? ex.getMessage() : "Resource not found";
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", error, "exception", ex.getClass().getName(), "cause", "No cause"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handle(RuntimeException ex) {
        ex.printStackTrace();
        System.err.println("RuntimeException handled: " + ex.getMessage());
        String error = ex.getMessage() != null ? ex.getMessage() : "Unknown error";
        String cause = ex.getCause() != null ? ex.getCause().toString() : "No cause";
        return ResponseEntity.badRequest().body(
                Map.of("error", error, "exception", ex.getClass().getName(), "cause", cause));
    }

    @ExceptionHandler(ContentViolationException.class)
    public ResponseEntity<?> handleContentViolation(ContentViolationException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(500).body(
                Map.of("error", "Internal server error", "details", ex.getMessage() != null ? ex.getMessage() : ""));
    }
}
