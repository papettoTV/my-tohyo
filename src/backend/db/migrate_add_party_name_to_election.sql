-- Add party_name column to ELECTION to persist primary party context
ALTER TABLE ELECTION
ADD COLUMN IF NOT EXISTS party_name VARCHAR(100);
