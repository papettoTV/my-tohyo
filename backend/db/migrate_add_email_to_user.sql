-- USERテーブルにemailカラムを追加し、NOT NULL & UNIQUE制約を付与するマイグレーション

-- 1. emailカラムをNULL許容で追加
ALTER TABLE user ADD COLUMN email VARCHAR(255);

-- 2. 既存レコードにダミーemailを投入（本番では適切な値を投入すること）
UPDATE user SET email = CONCAT('dummy', user_id, '@example.com') WHERE email IS NULL;

-- 3. emailカラムにNOT NULL制約とUNIQUE制約を付与
ALTER TABLE user ALTER COLUMN email SET NOT NULL;
CREATE UNIQUE INDEX user_email_unique_idx ON user(email);
