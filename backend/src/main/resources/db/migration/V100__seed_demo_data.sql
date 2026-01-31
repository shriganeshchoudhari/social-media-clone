-- USERS
INSERT INTO users (username, email, password, bio)
VALUES
('ganesh', 'ganesh@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'Java Full Stack Dev'),
('rohan', 'rohan@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'React Developer'),
('sneha', 'sneha@test.com', '$2b$12$5dwDMEU6CeyO8EQKlGwz/OZFsXillPSs5.LSs3lc0jnPJzngHdCHu', 'DevOps Engineer');

-- POSTS
INSERT INTO posts (author_id, content)
VALUES
(1, 'Hello world! First post on Social.'),
(2, 'React UI is coming together nicely.'),
(3, 'DevOps + Full Stack is unstoppable.');

-- FOLLOWS
INSERT INTO follows (follower_id, following_id)
VALUES
(1, 2),
(1, 3),
(2, 3);

-- LIKES
INSERT INTO post_likes (post_id, user_id)
VALUES
(1, 2),
(1, 3),
(2, 1);

-- COMMENTS
INSERT INTO comments (post_id, author_id, content)
VALUES
(1, 2, 'Nice start!'),
(1, 3, 'Let’s build something big.'),
(2, 1, 'React is clean.');
