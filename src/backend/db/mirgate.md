# マイグレーションする方法

## コマンド実行例

docker exec -i my_tohyo_postgres psql -U myuser -d mydb -c "ALTER TABLE VOTE_RECORD ADD COLUMN social_post_url VARCHAR(255);"

## ファイル指定例

psql "postgresql://myuser:mypassword@localhost:5432/my-tohyo" -f backend/db/migrate_add_social_post_url_to_vote_record.sql
