-- V102__more_seed_data.sql
-- Additional seeding for recommendation engine testing

-- More posts with specific keywords for recommendation testing
INSERT INTO posts (author_id, content, created_at) VALUES
(8, 'Just finished a marathon coding session in Java. Streams API is powerful!', NOW() - INTERVAL '1 hour'),
(9, 'The future of tech is AI and machine learning. #tech #ai', NOW() - INTERVAL '2 hours'),
(10, 'Anyone else love photography? Just bought a new lens.', NOW() - INTERVAL '3 hours'),
(11, 'Travel tips for Europe? Planning a trip soon.', NOW() - INTERVAL '4 hours'),
(12, 'React 19 is coming! Can''t wait to try the new compiler.', NOW() - INTERVAL '5 hours'),
(5, 'Hiking in the mountains today. nature is beautiful.', NOW() - INTERVAL '6 hours'),
(6, 'Best VS Code extensions for Python development?', NOW() - INTERVAL '7 hours'),
(13, 'Sushi in Tokyo was amazing! #travel #food', NOW() - INTERVAL '8 hours'),
(14, 'Why I switched from Java to Kotlin.', NOW() - INTERVAL '9 hours'),
(15, 'Looking for a new laptop. M3 MacBook or Dell XPS? #tech', NOW() - INTERVAL '10 hours'),
(8, 'Music production is my therapy.', NOW() - INTERVAL '11 hours'),
(9, 'Climate change is real. We need to act now.', NOW() - INTERVAL '12 hours'),
(10, 'Streaming some Valorant tonight. Come hang out!', NOW() - INTERVAL '13 hours'),
(11, 'Reading "Clean Code" again. A classic.', NOW() - INTERVAL '14 hours'),
(12, 'Svelte vs React? What are your thoughts?', NOW() - INTERVAL '15 hours'),
(5, 'DIY home automation project success!', NOW() - INTERVAL '16 hours'),
(6, 'Coffee and code. The best combination.', NOW() - INTERVAL '17 hours'),
(13, 'Backpacking through Southeast Asia next month.', NOW() - INTERVAL '18 hours'),
(14, 'CSS Grid is a lifesaver.', NOW() - INTERVAL '19 hours'),
(15, 'SpaceX launch was incredible to watch.', NOW() - INTERVAL '20 hours');

-- Add images to some new posts (assuming IDs continue from 44, approx 45-64)
-- Note: IDs are auto-increment, so we need to be careful. In V101 last post ID is likely around 45 (22 + 4-25 = ~25, then more inserts... wait V101 inserts explicitly? No, auto-increment)
-- V101 inserts posts with specific IDs? No, the SQL was 'INSERT INTO posts (author_id, ...)'
-- Wait, V101 uses auto-increment for Posts?
-- Looking at V101: `INSERT INTO posts (author_id, content, created_at) VALUES ...` (no ID).
-- So I cannot predict IDs easily for images.
-- I'll skip adding images to these specific posts to avoid foreign key errors, or use a subquery if supported.
-- Postgres supports `INSERT INTO ... RETURNING`, but hard in simple SQL script.
-- I'll just leave them text-only for now, which is fine for search/recommendation testing.
