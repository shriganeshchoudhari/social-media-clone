package com.example.social.story;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoryPollVoteRepository extends JpaRepository<StoryPollVote, Long> {
    boolean existsByPollAndUser(StoryPoll poll, User user);

    Optional<StoryPollVote> findByPollAndUser(StoryPoll poll, User user);
}
