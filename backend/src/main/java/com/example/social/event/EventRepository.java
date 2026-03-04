package com.example.social.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.social.chat.ChatGroup;

public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByChatGroup(ChatGroup chatGroup, Pageable pageable);

    // List<Event> findByChatGroupAndStartTimeAfterOrderByStartTimeAsc(ChatGroup
    // chatGroup, LocalDateTime startTime);
}
