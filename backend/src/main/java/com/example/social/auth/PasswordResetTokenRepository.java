package com.example.social.auth;

import com.example.social.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByUserAndTokenAndUsedFalse(User user, String token);

    void deleteByUser(User user);
}
