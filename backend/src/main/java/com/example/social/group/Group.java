package com.example.social.group;

import com.example.social.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity(name = "SocialGroup")
@Table(name = "social_groups")
// Postgres is okay with it if quoted, but JPA handles it.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private GroupPrivacy privacy = GroupPrivacy.PUBLIC;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    private String coverImageUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pinned_post_id")
    private com.example.social.post.Post pinnedPost;

    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum GroupPrivacy {
        PUBLIC,
        PRIVATE
    }
}
