package com.example.social.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {

    List<AdminAuditLog> findTop50ByOrderByCreatedAtDesc();
}
