package com.example.social.admin;

import com.example.social.moderation.ReportRepository;
import com.example.social.post.PostService;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import com.example.social.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
@Tag(name = "Admin", description = "Administrative and moderation endpoints (requires ADMIN or MODERATOR role)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final PostService postService;
    private final UserService userService;
    private final AdminAuditService auditService;
    private final AdminAuditLogRepository auditRepo;

    public AdminController(
            UserRepository userRepository,
            ReportRepository reportRepository,
            PostService postService,
            UserService userService,
            AdminAuditService auditService,
            AdminAuditLogRepository auditRepo) {
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
        this.postService = postService;
        this.userService = userService;
        this.auditService = auditService;
        this.auditRepo = auditRepo;
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Retrieve list of all registered users (Admin/Moderator only)")
    public List<User> users() {
        return userRepository.findAll();
    }

    @GetMapping("/reports")
    @Transactional(readOnly = true)
    public List<com.example.social.admin.dto.ReportDto> reports() {
        return reportRepository.findAll().stream()
                .map(r -> new com.example.social.admin.dto.ReportDto(
                        r.getId(),
                        r.getReason(),
                        r.getPost() != null ? r.getPost().getId() : null,
                        r.getPost() != null ? r.getPost().getContent() : "Content Unavailable",
                        r.getReporter() != null ? r.getReporter().getUsername() : "Unknown",
                        java.time.LocalDateTime.now() // or r.getCreatedAt() if you add it to entity
                ))
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/ban/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ban user", description = "Permanently ban a user (Admin only)")
    public void ban(@Parameter(description = "Username to ban") @PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(true);
        userRepository.save(user);
    }

    @PostMapping("/unban/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public void unban(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBanned(false);
        userRepository.save(user);
    }

    @PostMapping("/warn/{username}")
    public void warn(@PathVariable String username, Authentication auth) {
        userService.warn(username);
        auditService.log(auth.getName(), "WARN", username, "Issued warning");
    }

    @PostMapping("/suspend/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public void suspend(@PathVariable String username, @RequestParam int days, Authentication auth) {
        userService.suspend(username, days);
        auditService.log(auth.getName(), "SUSPEND", username, "Suspended for " + days + " days");
    }

    @PostMapping("/unsuspend/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public void unsuspend(@PathVariable String username, Authentication auth) {
        userService.unsuspend(username);
        auditService.log(auth.getName(), "UNSUSPEND", username, "Unsuspended user");
    }

    @DeleteMapping("/posts/{postId}")
    @Operation(summary = "Delete post", description = "Delete a post as admin/moderator")
    public void deletePost(@Parameter(description = "Post ID to delete") @PathVariable Long postId,
            Authentication auth) {
        // Log first because post might be gone after delete (though we only need ID)
        auditService.log(auth.getName(), "DELETE_POST", "Post ID " + postId, "Deleted post by admin");

        // Delete reports first (cascade manual if needed, but repo handles it)
        reportRepository.deleteByPostId(postId);
        postService.deleteAdminPost(postId);
    }

    @DeleteMapping("/reports/{reportId}")
    public void deleteReport(@PathVariable Long reportId, Authentication auth) {
        reportRepository.deleteById(reportId);
        auditService.log(auth.getName(), "DELETE_REPORT", "Report ID " + reportId, "Deleted report");
    }

    @GetMapping("/audit")
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<com.example.social.admin.dto.AdminAuditLogDto> audit() {
        return auditRepo.findTop50ByOrderByCreatedAtDesc().stream()
                .map(log -> new com.example.social.admin.dto.AdminAuditLogDto(
                        log.getId(),
                        log.getAction(),
                        log.getTargetUsername(),
                        log.getDetails(),
                        log.getAdmin() != null ? log.getAdmin().getUsername() : "System",
                        log.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }
}
