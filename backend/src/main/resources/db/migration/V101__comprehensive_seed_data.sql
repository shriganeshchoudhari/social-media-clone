-- V101__comprehensive_seed_data.sql
-- Adds extensive seeding data for development and testing

-- 1. USERS (IDs 4-15)
-- Password is 'admin123' hash from V100
INSERT INTO users (username, email, password, bio, role, profile_image_url) VALUES
('alice_w', 'alice@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Digital Nomad & Photographer', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'),
('bob_builder', 'bob@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Building things that break', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'),
('charlie_d', 'charlie@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Coffee addict ☕', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'),
('diana_p', 'diana@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Tech enthusiast', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'),
('evan_m', 'evan@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Music producer 🎵', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan'),
('fiona_g', 'fiona@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Green energy advocate 🌱', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona'),
('george_k', 'george@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Gamer / Streamer 🎮', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=George'),
('hannah_s', 'hannah@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Writer & Poet ✍️', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah'),
('ian_t', 'ian@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Full stack dev', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ian'),
('julia_r', 'julia@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Traveler ✈️', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia'),
('kevin_l', 'kevin@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Just here for the memes', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin'),
('luna_sky', 'luna@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Stargazer 🔭', 'USER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna');

-- 2. POSTS (IDs 4-25)
INSERT INTO posts (author_id, content, created_at) VALUES
(4, 'Just arrived in Bali! The view is amazing.', NOW() - INTERVAL '10 days'),
(5, 'Building a new deck this weekend. Wish me luck.', NOW() - INTERVAL '9 days'),
(6, 'Anyone know a good dark roast coffee bean?', NOW() - INTERVAL '9 days'),
(7, 'Just upgraded my GPU. Frame rates are insane!', NOW() - INTERVAL '8 days'),
(8, 'New track dropping soon. Stay tuned.', NOW() - INTERVAL '8 days'),
(9, 'Solar panels are finally installed! ☀️', NOW() - INTERVAL '7 days'),
(10, 'Live on Twitch in 30 mins! Playing Elden Ring.', NOW() - INTERVAL '7 days'),
(11, 'The rain outside is perfect writing weather.', NOW() - INTERVAL '6 days'),
(12, 'Java 21 features are pretty cool actually.', NOW() - INTERVAL '6 days'),
(13, 'Booked tickets to Japan! 🇯🇵', NOW() - INTERVAL '5 days'),
(4, 'Missing the office... said no one ever.', NOW() - INTERVAL '5 days'),
(5, 'Project complete! Check out the photos.', NOW() - INTERVAL '4 days'),
(6, 'Found the perfect espresso blend.', NOW() - INTERVAL '4 days'),
(8, 'Beat drop is sick on this one.', NOW() - INTERVAL '3 days'),
(10, 'That boss fight took me 4 hours...', NOW() - INTERVAL '3 days'),
(12, 'Trying out SvelteKit for the next project.', NOW() - INTERVAL '2 days'),
(14, 'Why is centering a div still hard in 2026?', NOW() - INTERVAL '2 days'),
(15, 'Look at the moon tonight!', NOW() - INTERVAL '1 day'),
(7, 'Tech conference next week. Who is going?', NOW() - INTERVAL '1 day'),
(9, 'Save the bees! 🐝', NOW() - INTERVAL '12 hours'),
(11, 'Chapter 3 is done.', NOW() - INTERVAL '1 hour'),
(13, 'Anyone have recommendations for Kyoto?', NOW() - INTERVAL '30 minutes');

-- 3. FOLLOWS
INSERT INTO follows (follower_id, following_id) VALUES
(4, 5), (4, 6), (4, 10), (4, 13),
(5, 4), (5, 7), (5, 8),
(6, 4), (6, 5), (6, 11),
(7, 10), (7, 12),
(8, 5), (8, 9),
(9, 8), (9, 15),
(10, 7), (10, 14),
(11, 6), (11, 13),
(12, 7), (12, 14), (12, 10),
(13, 4), (13, 11),
(14, 7), (14, 12),
(15, 9), (15, 12);

-- 4. LIKES
INSERT INTO post_likes (post_id, user_id) VALUES
(4, 5), (4, 6), (4, 13),
(5, 4), (5, 8),
(6, 4), (6, 11),
(7, 10), (7, 12), (7, 14),
(8, 5), (8, 9), (8, 15),
(10, 7), (10, 12), (10, 14),
(11, 6), (11, 13),
(12, 7), (12, 14),
(13, 4), (13, 11), (13, 15),
(16, 12), (16, 14),
(20, 5), (20, 8), (20, 15);

-- 5. COMMENTS
INSERT INTO comments (post_id, author_id, content, created_at) VALUES
(4, 5, 'Looks incredible!', NOW() - INTERVAL '9 days'),
(4, 13, 'Have fun!', NOW() - INTERVAL '9 days'),
(5, 4, 'Don''t hammer your thumb.', NOW() - INTERVAL '8 days'),
(6, 11, 'Try Blue Bottle.', NOW() - INTERVAL '8 days'),
(7, 10, 'Specs?', NOW() - INTERVAL '8 days'),
(10, 7, 'watching now!', NOW() - INTERVAL '7 days'),
(12, 14, 'Records enable some nice patterns.', NOW() - INTERVAL '6 days'),
(13, 4, 'Eat all the sushi!', NOW() - INTERVAL '5 days'),
(13, 11, 'Jealous!', NOW() - INTERVAL '5 days'),
(15, 12, 'GG', NOW() - INTERVAL '3 days'),
(20, 15, 'Love this.', NOW() - INTERVAL '10 hours');

-- 6. MESSAGES
INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES
(4, 5, 'Hey, how is the project going?', NOW() - INTERVAL '5 days'),
(5, 4, 'Almost done, just validating.', NOW() - INTERVAL '5 days'),
(6, 11, 'Did you finish that book?', NOW() - INTERVAL '4 days'),
(11, 6, 'Yes! The ending was wild.', NOW() - INTERVAL '4 days'),
(7, 10, 'Duo later?', NOW() - INTERVAL '3 days'),
(10, 7, 'Sure, let me eat first.', NOW() - INTERVAL '3 days'),
(12, 14, 'Seen the new React docs?', NOW() - INTERVAL '2 days'),
(14, 12, 'Yeah, server components are interesting.', NOW() - INTERVAL '2 days'),
(13, 4, 'Safe travels!', NOW() - INTERVAL '1 day'),
(4, 13, 'Thanks!', NOW() - INTERVAL '1 day');

-- 7. NOTIFICATIONS (Simulating recent activity)
INSERT INTO notifications (user_id, message, is_read, type, reference_id, actor_username, created_at) VALUES
(5, 'alice_w liked your post', FALSE, 'LIKE', 5, 'alice_w', NOW() - INTERVAL '8 days'),
(4, 'bob_builder commented on your post', TRUE, 'COMMENT', 4, 'bob_builder', NOW() - INTERVAL '9 days'),
(10, 'george_k started following you', TRUE, 'FOLLOW', 7, 'george_k', NOW() - INTERVAL '7 days'),
(14, 'ian_t liked your post', FALSE, 'LIKE', 12, 'ian_t', NOW() - INTERVAL '6 days'),
(12, 'kevin_l sent you a message', FALSE, 'MESSAGE', NULL, 'kevin_l', NOW() - INTERVAL '2 days'),
(13, 'alice_w commented on your post', FALSE, 'COMMENT', 13, 'alice_w', NOW() - INTERVAL '5 days'),
(15, 'hannah_s started following you', FALSE, 'FOLLOW', 11, 'hannah_s', NOW() - INTERVAL '1 day'),
(7, 'luna_sky liked your post', TRUE, 'LIKE', 7, 'luna_sky', NOW() - INTERVAL '1 day'),
(8, 'fiona_g started following you', TRUE, 'FOLLOW', 9, 'fiona_g', NOW() - INTERVAL '3 days'),
(6, 'charlie_d commented on your post', FALSE, 'COMMENT', 6, 'charlie_d', NOW() - INTERVAL '4 days');

-- 8. ADMIN AUDIT LOGS
-- Assuming admin (id 1) exists from previous migrations/seeding
INSERT INTO admin_audit_logs (admin_id, action, target_username, details, created_at) VALUES
(1, 'USER_BAN', 'bot_user_99', 'Banned for spamming', NOW() - INTERVAL '20 days'),
(1, 'POST_DELETE', 'spammer_1', 'Deleted inappropriate content', NOW() - INTERVAL '18 days'),
(1, 'USER_ROLE_UPDATE', 'moderator_tim', 'Promoted to MODERATOR', NOW() - INTERVAL '15 days'),
(1, 'SYSTEM_CONFIG', NULL, 'Updated rate limits', NOW() - INTERVAL '10 days'),
(1, 'USER_UNBAN', 'mistake_user', 'Ban appealed and revoked', NOW() - INTERVAL '8 days'),
(1, 'REPORT_RESOLVE', 'troll_2', 'Resolved harassment report', NOW() - INTERVAL '5 days'),
(1, 'USER_WARN', 'loud_mouth', 'Warning for offensive language', NOW() - INTERVAL '4 days'),
(1, 'POST_DELETE', 'scammer_x', 'Crypto scam removal', NOW() - INTERVAL '2 days'),
(1, 'USER_BAN', 'scammer_x', 'Permanent ban for fraud', NOW() - INTERVAL '2 days'),
(1, 'SYSTEM_MAINTENANCE', NULL, 'Cleared cache', NOW() - INTERVAL '12 hours');

-- 9. USER ROLES (Assuming V14 added 'role' column)
-- Updating a few generated users to be moderators/admins if needed, but currently all 'USER'.
-- Let's make one moderator.
UPDATE users SET role = 'MODERATOR' WHERE username = 'diana_p';

-- 10. POST IMAGES (V6 table)
INSERT INTO post_images (post_id, url) VALUES
(4, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'),
(5, 'https://images.unsplash.com/photo-1503387762-592deb58ef4e'),
(9, 'https://images.unsplash.com/photo-1509391366360-2e959784a276'),
(10, 'https://images.unsplash.com/photo-1542751371-adc38448a05e'),
(13, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e'),
(15, 'https://images.unsplash.com/photo-1511512578047-dfb367046420'),
(18, 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d'),
(19, 'https://images.unsplash.com/photo-1544531586-fde5298cdd40'),
(20, 'https://images.unsplash.com/photo-1470114716159-e389f87b9641');

-- 11. BLOCKS (V11)
INSERT INTO blocks (blocker_id, blocked_id) VALUES
(5, 7), (12, 11), (4, 15), (7, 5), (6, 12),
(14, 10), (9, 11), (8, 4), (10, 15), (13, 6);

-- 12. REPORTS (V12)
INSERT INTO reports (post_id, reporter_id, reason, created_at) VALUES
(5, 4, 'Spam content', NOW() - INTERVAL '8 days'),
(7, 10, 'Offensive language during game rant', NOW() - INTERVAL '7 days'),
(10, 5, 'Copyright violation', NOW() - INTERVAL '6 days'),
(12, 14, 'Misleading technical info', NOW() - INTERVAL '5 days'),
(14, 6, 'Harassment', NOW() - INTERVAL '4 days'),
(16, 11, 'Not suitable for work', NOW() - INTERVAL '3 days'),
(18, 9, 'Bot behavior', NOW() - INTERVAL '2 days'),
(20, 15, 'Spam link', NOW() - INTERVAL '1 day'),
(22, 13, 'Duplicate post', NOW() - INTERVAL '12 hours'),
(23, 7, 'Fake news', NOW() - INTERVAL '1 hour');

-- 13. USER INTERESTS (V16)
INSERT INTO user_interests (user_id, tag) VALUES
(4, 'tech'), (4, 'travel'), (4, 'photography'),
(5, 'diy'), (5, 'music'),
(6, 'coffee'), (6, 'gaming'),
(7, 'gaming'), (7, 'tech'),
(8, 'music'), (8, 'production'),
(9, 'tech'), (9, 'environment'),
(10, 'gaming'), (10, 'streaming'),
(11, 'writing'), (11, 'books'),
(12, 'coding'), (12, 'react'),
(13, 'travel'), (13, 'food'),
(14, 'coding'), (14, 'memes'),
(15, 'space'), (15, 'science');
