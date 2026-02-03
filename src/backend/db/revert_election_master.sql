-- Migration Script to Revert ELECTION Master

-- 1. Add election_name back
ALTER TABLE VOTE_RECORD ADD COLUMN election_name VARCHAR(150);
ALTER TABLE CANDIDATE_CONTENT ADD COLUMN election_name VARCHAR(150);

-- 2. Populate election_name from ELECTION table
UPDATE VOTE_RECORD vr
SET election_name = e.name
FROM ELECTION e
WHERE vr.election_id = e.election_id;

UPDATE CANDIDATE_CONTENT cc
SET election_name = e.name
FROM ELECTION e
WHERE cc.election_id = e.election_id;

-- 3. Set NOT NULL
ALTER TABLE VOTE_RECORD ALTER COLUMN election_name SET NOT NULL;
ALTER TABLE CANDIDATE_CONTENT ALTER COLUMN election_name SET NOT NULL;

-- 4. Remove election_id and ELECTION table
ALTER TABLE VOTE_RECORD DROP COLUMN election_id;
ALTER TABLE CANDIDATE_CONTENT DROP COLUMN election_id;
DROP TABLE ELECTION;

-- 5. Update Unique constraint on CANDIDATE_CONTENT
ALTER TABLE CANDIDATE_CONTENT DROP CONSTRAINT candidate_content_candidate_id_party_id_election_id_type_key;
ALTER TABLE CANDIDATE_CONTENT ADD UNIQUE (candidate_id, party_id, election_name, type);
