-- my-tohyo DB用テーブル定義

CREATE TABLE user (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  region VARCHAR(100) NOT NULL
);

CREATE TABLE SOCIAL_ACCOUNT (
  social_account_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  provider VARCHAR(50) NOT NULL,
  account_identifier VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE CANDIDATE_CONTENT (
  content_id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'manifesto' or 'achievement'
  election_name VARCHAR(150) NOT NULL,
  candidate_id INTEGER REFERENCES CANDIDATE(candidate_id) ON DELETE CASCADE,
  party_id INTEGER REFERENCES PARTY(party_id) ON DELETE CASCADE,
  candidate_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  content_format VARCHAR(20) NOT NULL DEFAULT 'markdown', -- 'markdown' or 'html'
  status VARCHAR(20), -- 'PROGRESS' or 'COMPLETE'
  UNIQUE (candidate_id, party_id, election_name, type)
);

CREATE TABLE VOTE_RECORD (
  vote_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  candidate_name VARCHAR(100),
  election_name VARCHAR(150) NOT NULL,
  election_type_id INTEGER NOT NULL REFERENCES ELECTION_TYPE(election_type_id) ON DELETE RESTRICT,
  vote_date DATE NOT NULL,
  party_id INTEGER REFERENCES PARTY(party_id) ON DELETE SET NULL,
  photo_url VARCHAR(255),
  social_post_url VARCHAR(255),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);
