-- Add party_id to MANIFESTO / ACHIEVEMENT and align unique constraints
BEGIN;

ALTER TABLE manifesto
  ADD COLUMN IF NOT EXISTS party_id INTEGER;

ALTER TABLE manifesto
  ALTER COLUMN candidate_id DROP NOT NULL;

ALTER TABLE manifesto
  DROP CONSTRAINT IF EXISTS manifesto_party_id_fkey;

ALTER TABLE manifesto
  ADD CONSTRAINT manifesto_party_id_fkey
    FOREIGN KEY (party_id) REFERENCES party(party_id) ON DELETE SET NULL;

ALTER TABLE manifesto
  DROP CONSTRAINT IF EXISTS manifesto_candidate_id_election_name_key;

ALTER TABLE manifesto
  DROP CONSTRAINT IF EXISTS manifesto_candidate_election_unique;

ALTER TABLE manifesto
  DROP CONSTRAINT IF EXISTS manifesto_candidate_party_election_unique;

ALTER TABLE manifesto
  ADD CONSTRAINT manifesto_candidate_party_election_unique
    UNIQUE (candidate_id, party_id, election_name);

ALTER TABLE achievement
  ADD COLUMN IF NOT EXISTS party_id INTEGER;

ALTER TABLE achievement
  ALTER COLUMN candidate_id DROP NOT NULL;

ALTER TABLE achievement
  DROP CONSTRAINT IF EXISTS achievement_party_id_fkey;

ALTER TABLE achievement
  ADD CONSTRAINT achievement_party_id_fkey
    FOREIGN KEY (party_id) REFERENCES party(party_id) ON DELETE SET NULL;

ALTER TABLE achievement
  DROP CONSTRAINT IF EXISTS achievement_candidate_id_election_name_key;

ALTER TABLE achievement
  DROP CONSTRAINT IF EXISTS achievement_candidate_name_election_name_key;

ALTER TABLE achievement
  DROP CONSTRAINT IF EXISTS achievement_candidate_election_unique;

ALTER TABLE achievement
  DROP CONSTRAINT IF EXISTS achievement_candidate_party_election_unique;

ALTER TABLE achievement
  ADD CONSTRAINT achievement_candidate_party_election_unique
    UNIQUE (candidate_id, party_id, election_name);

COMMIT;
