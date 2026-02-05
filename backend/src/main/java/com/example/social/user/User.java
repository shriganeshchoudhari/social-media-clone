package com.example.social.user;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 200)
    private String bio;

    private String profileImageUrl;

    private LocalDateTime createdAt;

    @Builder.Default
    @JsonProperty("isPrivate")
    private boolean isPrivate = false;

    @Builder.Default
    private int tokenVersion = 0;

    @Builder.Default
    private boolean isBanned = false;

    @Builder.Default
    @Column(length = 20)
    private String role = "USER";

    @Builder.Default
    private int warningCount = 0;

    private LocalDateTime bannedUntil;

    public boolean isSuspended() {
        return bannedUntil != null && bannedUntil.isAfter(LocalDateTime.now());
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
