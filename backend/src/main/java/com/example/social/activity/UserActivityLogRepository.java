package com.example.social.activity;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface UserActivityLogRepository extends MongoRepository<UserActivityLog, String> {
    List<UserActivityLog> findByUserId(Long userId);

    List<UserActivityLog> findByUsername(String username);
}
