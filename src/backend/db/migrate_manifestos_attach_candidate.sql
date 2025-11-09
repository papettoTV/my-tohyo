-- Attach MANIFESTO rows to CANDIDATE via candidate_id and allow candidates without parties.
-- This script is idempotent and safe to run multiple times.

BEGIN;

-- 1. Allow CANDIDATE.party_id to be NULL (required for auto-created candidates)
ALTER TABLE CANDIDATE
  ALTER COLUMN party_id DROP NOT NULL;

-- 2. Add candidate_id column to MANIFESTO if missing
ALTER TABLE MANIFESTO
  ADD COLUMN IF NOT EXISTS candidate_id INTEGER;

-- 3. Prepare helper temp table for case-insensitive matching
CREATE TEMP TABLE __tmp_manifesto_candidates AS
SELECT DISTINCT
  LOWER(candidate_name) AS candidate_name_lower,
  candidate_name
FROM MANIFESTO;

-- 4. Ensure all manifesto candidates exist in CANDIDATE table
INSERT INTO CANDIDATE (name, party_id, manifesto_url, achievements)
SELECT t.candidate_name, NULL, NULL, NULL
FROM __tmp_manifesto_candidates t
WHERE NOT EXISTS (
  SELECT 1
  FROM CANDIDATE c
  WHERE LOWER(c.name) = t.candidate_name_lower
);

-- 5. Populate candidate_id in MANIFESTO using case-insensitive matching
UPDATE MANIFESTO m
SET candidate_id = c.candidate_id,
    candidate_name = c.name
FROM CANDIDATE c
WHERE m.candidate_id IS NULL
  AND LOWER(c.name) = LOWER(m.candidate_name);

-- 6. Enforce NOT NULL now that all records are populated
ALTER TABLE MANIFESTO
  ALTER COLUMN candidate_id SET NOT NULL;

-- 7. Drop legacy unique constraint if present and create the new one
ALTER TABLE MANIFESTO
  DROP CONSTRAINT IF EXISTS manifesto_candidate_name_election_name_key;

ALTER TABLE MANIFESTO
  DROP CONSTRAINT IF EXISTS "UQ_705dd83ae6f08a4caf5615db9ca";

ALTER TABLE MANIFESTO
  DROP CONSTRAINT IF EXISTS manifesto_candidate_id_election_name_key;

ALTER TABLE MANIFESTO
  ADD CONSTRAINT manifesto_candidate_id_election_name_key
    UNIQUE (candidate_id, election_name);

-- 8. Add foreign key to CANDIDATE (replace if already present)
ALTER TABLE MANIFESTO
  DROP CONSTRAINT IF EXISTS manifesto_candidate_id_fkey;

ALTER TABLE MANIFESTO
  ADD CONSTRAINT manifesto_candidate_id_fkey
    FOREIGN KEY (candidate_id) REFERENCES CANDIDATE(candidate_id)
    ON DELETE CASCADE;

-- 9. Cleanup temp table
DROP TABLE IF EXISTS __tmp_manifesto_candidates;

COMMIT;
