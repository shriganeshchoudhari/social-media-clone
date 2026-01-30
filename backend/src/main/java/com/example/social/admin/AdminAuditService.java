package com.example.social.admin;

import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditService {

    private final AdminAuditLogRepository auditRepo;
    private final UserRepository userRepo;

    public void log(String adminUsername,
            String action,
            String targetUser,
            String details) {

        User admin = userRepo.findByUsername(adminUsername).orElseThrow();

        auditRepo.save(
                AdminAuditLog.builder()
                        .admin(admin)
                        .action(action)
                        .targetUsername(targetUser)
                        .details(details)
                        .build());
    }
}
