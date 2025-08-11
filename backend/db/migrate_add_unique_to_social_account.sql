-- SOCIAL_ACCOUNTテーブルに (provider, account_identifier) のユニーク制約を追加

CREATE UNIQUE INDEX social_account_provider_identifier_unique_idx
  ON SOCIAL_ACCOUNT(provider, account_identifier);
