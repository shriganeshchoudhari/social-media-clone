package com.example.social.activity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ActivityLogService {

    private final UserActivityLogRepository repository;

    public ActivityLogService(@Autowired(required = false) UserActivityLogRepository repository) {
        this.repository = repository;
    }

    @Async
    public void logActivity(Long userId, String username, String action, String details, Map<String, Object> metadata) {
        if (repository == null) {
            // MongoDB not configured, skip logging
            return;
        }

        UserActivityLog log = new UserActivityLog();
        log.setUserId(userId);
        log.setUsername(username);
        log.setAction(action);
        log.setDetails(details);
        log.setMetadata(metadata);
        log.setTimestamp(LocalDateTime.now());

        repository.save(log);
    }
}
