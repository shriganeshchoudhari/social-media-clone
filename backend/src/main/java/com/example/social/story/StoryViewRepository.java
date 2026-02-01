package com.example.social.story;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    boolean existsByStoryAndViewer(Story story, User viewer);

    long countByStory(Story story);

    List<StoryView> findByStoryOrderByViewedAtDesc(Story story);
}
