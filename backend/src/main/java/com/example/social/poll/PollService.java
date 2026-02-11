package com.example.social.poll;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;
    private final UserRepository userRepository;

    public PollService(PollRepository pollRepository, PollOptionRepository pollOptionRepository,
            PollVoteRepository pollVoteRepository,
            UserRepository userRepository) {
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.pollVoteRepository = pollVoteRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void vote(Long pollId, Long optionId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new RuntimeException("Poll not found"));

        if (poll.isClosed()
                || (poll.getExpiryDateTime() != null && poll.getExpiryDateTime().isBefore(LocalDateTime.now()))) {
            throw new RuntimeException("Poll is closed");
        }

        if (pollVoteRepository.existsByUserAndPoll(user, poll)) {
            // Optional: Allow changing vote? For now, no.
            throw new RuntimeException("You have already voted on this poll");
        }

        PollOption option = pollOptionRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option not found"));

        if (!option.getPoll().getId().equals(pollId)) {
            throw new RuntimeException("Invalid option for this poll");
        }

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        PollVote vote = PollVote.builder()
                .user(user)
                .poll(poll)
                .pollOption(option)
                .build();

        pollVoteRepository.save(vote);
    }
}
