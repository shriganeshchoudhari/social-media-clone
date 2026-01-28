-- Add post_images table for multiple images per post
CREATE TABLE post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL
);

-- Migrate existing single images to new table
INSERT INTO post_images (post_id, url)
SELECT id, image_url
FROM posts
WHERE image_url IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_post_images_post_id ON post_images(post_id);
