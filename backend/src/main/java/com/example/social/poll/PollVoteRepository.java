package com.example.social.poll;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {
    boolean existsByUserAndPoll(User user, Poll poll);

    Optional<PollVote> findByUserAndPoll(User user, Poll poll);
}
