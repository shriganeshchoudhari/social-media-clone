-- Add image support to chat messages
ALTER TABLE messages
ADD COLUMN image_url TEXT;
