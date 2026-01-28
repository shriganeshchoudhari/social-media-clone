package com.example.social.moderation;

import com.example.social.post.Post;
import com.example.social.post.PostRepository;
import com.example.social.user.User;
import com.example.social.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ModerationService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public void reportPost(String reporterUsername, Long postId, String reason) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Report report = new Report();
        report.setReporter(reporter);
        report.setPost(post);
        report.setReason(reason);

        reportRepository.save(report);
    }
}
