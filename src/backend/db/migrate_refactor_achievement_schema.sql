-- Refactor ACHIEVEMENT table to match MANIFESTO schema (Candidate x Election)

BEGIN;

-- 1. Add candidate_id column (Nullable initially)
ALTER TABLE ACHIEVEMENT
  ADD COLUMN IF NOT EXISTS candidate_id INTEGER;

-- 2. Populate candidate_id using candidate_name
UPDATE ACHIEVEMENT a
SET candidate_id = c.candidate_id
FROM CANDIDATE c
WHERE a.candidate_id IS NULL
  AND LOWER(c.name) = LOWER(a.candidate_name);

-- 3. Handle orphans (optional: insert into candidate? or delete? for now we delete orphans as safe fallback)
-- In a real scenario we might want to create candidates, but for now assuming data consistency.
DELETE FROM ACHIEVEMENT WHERE candidate_id IS NULL;

-- 4. Enforce NOT NULL and Add Foreign Key
ALTER TABLE ACHIEVEMENT
  ALTER COLUMN candidate_id SET NOT NULL;

ALTER TABLE ACHIEVEMENT
  DROP CONSTRAINT IF EXISTS achievement_candidate_id_fkey;

ALTER TABLE ACHIEVEMENT
  ADD CONSTRAINT achievement_candidate_id_fkey
    FOREIGN KEY (candidate_id) REFERENCES CANDIDATE(candidate_id)
    ON DELETE CASCADE;

-- 5. Update Unique Constraint
-- Drop old constraint based on candidate_name if exists (name might vary, derived from \d output)
-- "UQ_1c91b35670d8404426efa77fcb5"
ALTER TABLE ACHIEVEMENT
  DROP CONSTRAINT IF EXISTS "UQ_1c91b35670d8404426efa77fcb5";

-- Also try dropping by standard naming convention just in case
ALTER TABLE ACHIEVEMENT
  DROP CONSTRAINT IF EXISTS achievement_candidate_name_election_name_key;

-- Add new constraint
ALTER TABLE ACHIEVEMENT
  ADD CONSTRAINT achievement_candidate_id_election_name_key UNIQUE (candidate_id, election_name);

COMMIT;
