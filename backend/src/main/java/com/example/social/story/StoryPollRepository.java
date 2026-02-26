package com.example.social.story;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoryPollRepository extends JpaRepository<StoryPoll, Long> {
}
