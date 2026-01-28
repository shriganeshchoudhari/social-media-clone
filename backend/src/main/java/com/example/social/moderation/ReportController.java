package com.example.social.moderation;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderation")
@RequiredArgsConstructor
public class ReportController {

    private final ModerationService moderationService;
    private final ReportRepository reportRepository;

    @PostMapping("/posts/{id}/report")
    public void report(
            @PathVariable Long id,
            @RequestParam String reason,
            Authentication auth) {
        moderationService.reportPost(auth.getName(), id, reason);
    }

    @GetMapping("/reports")
    // @PreAuthorize("hasRole('ADMIN')") // Commented out until we set up roles
    // properly
    public List<Report> allReports() {
        return reportRepository.findAll();
    }
}
