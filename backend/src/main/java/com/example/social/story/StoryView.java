package com.example.social.story;

import com.example.social.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "story_views", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "story_id", "viewer_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "view_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id", nullable = false)
    private User viewer;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    @PrePersist
    void onCreate() {
        this.viewedAt = LocalDateTime.now();
    }
}
