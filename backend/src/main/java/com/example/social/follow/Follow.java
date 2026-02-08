package com.example.social.follow;

import com.example.social.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "follows", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "follower_id", "following_id" })
})
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    public Follow() {
    }

    public Follow(Long id, User follower, User following) {
        this.id = id;
        this.follower = follower;
        this.following = following;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getFollower() {
        return follower;
    }

    public void setFollower(User follower) {
        this.follower = follower;
    }

    public User getFollowing() {
        return following;
    }

    public void setFollowing(User following) {
        this.following = following;
    }

    // Builder
    public static FollowBuilder builder() {
        return new FollowBuilder();
    }

    public static class FollowBuilder {
        private Long id;
        private User follower;
        private User following;

        public FollowBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public FollowBuilder follower(User follower) {
            this.follower = follower;
            return this;
        }

        public FollowBuilder following(User following) {
            this.following = following;
            return this;
        }

        public Follow build() {
            return new Follow(id, follower, following);
        }
    }
}
