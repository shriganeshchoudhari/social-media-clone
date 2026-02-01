ALTER TABLE comments ADD COLUMN parent_id BIGINT;

ALTER TABLE comments 
ADD CONSTRAINT fk_comment_parent 
FOREIGN KEY (parent_id) 
REFERENCES comments(id);
