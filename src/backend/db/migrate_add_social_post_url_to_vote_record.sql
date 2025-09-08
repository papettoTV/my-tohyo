-- Add social_post_url column to VOTE_RECORD to store URLs of SNS posts
ALTER TABLE VOTE_RECORD
ADD COLUMN social_post_url VARCHAR(255);
