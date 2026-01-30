package com.example.social.moderation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface ReportRepository extends JpaRepository<Report, Long> {
    @Transactional
    void deleteByPostId(Long postId);
}
