-- Migrate schema to drop ELECTION table and denormalise election_name/election_type on VOTE_RECORD
ALTER TABLE VOTE_RECORD DROP CONSTRAINT IF EXISTS vote_record_election_id_fkey;
ALTER TABLE VOTE_RECORD DROP COLUMN IF EXISTS election_id;
ALTER TABLE VOTE_RECORD ADD COLUMN IF NOT EXISTS election_name VARCHAR(150);
ALTER TABLE VOTE_RECORD ADD COLUMN IF NOT EXISTS election_type_id INTEGER;
ALTER TABLE VOTE_RECORD ADD COLUMN IF NOT EXISTS party_name VARCHAR(100);
ALTER TABLE VOTE_RECORD ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE VOTE_RECORD ADD COLUMN IF NOT EXISTS social_post_url VARCHAR(255);

-- Backfill election_type_id if needed (manual step depending on data availability)
-- UPDATE VOTE_RECORD vr SET election_type_id = e.election_type_id, election_name = e.name, party_name = e.party_name
-- FROM ELECTION e WHERE vr.election_id = e.election_id;

ALTER TABLE VOTE_RECORD
  ADD CONSTRAINT vote_record_election_type_id_fkey
  FOREIGN KEY (election_type_id) REFERENCES ELECTION_TYPE(election_type_id) ON DELETE RESTRICT;

DROP TABLE IF EXISTS ELECTION CASCADE;

-- Ensure new columns are not null where desired (requires data backfill beforehand)
ALTER TABLE VOTE_RECORD ALTER COLUMN election_name SET NOT NULL;
ALTER TABLE VOTE_RECORD ALTER COLUMN election_type_id SET NOT NULL;
