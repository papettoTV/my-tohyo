-- Rollback ACHIEVEMENT entity to CANDIDATE.achievements column
-- This script migrates data and drops the ACHIEVEMENT table.

BEGIN;

-- 1. Update CANDIDATE.achievements with content from ACHIEVEMENT
-- We prioritize the content from ACHIEVEMENT as it is the most recent.
UPDATE CANDIDATE c
SET achievements = a.content
FROM ACHIEVEMENT a
WHERE c.candidate_id = a.candidate_id;

-- 2. Drop ACHIEVEMENT table
DROP TABLE IF EXISTS ACHIEVEMENT CASCADE;

-- 3. Cleanup: If there were any foreign keys in VOTE_RECORD pointing to ACHIEVEMENT,
-- the CASCADE drop should have handled the FK constraint removal, 
-- but we should ensure the column is also removed if it exists (schema doesn't show it but just in case).
-- (Based on provided schema, VOTE_RECORD has no physical ACHIEVEMENT_ID column, 
--  the relationship was logical or via join table, but we double check).
ALTER TABLE VOTE_RECORD
  DROP COLUMN IF EXISTS achievement_id;

COMMIT;
