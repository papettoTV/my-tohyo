# 仕様：ソーシャルログイン時の挙動

ユーザの操作で、google ログイン実行時

- User モデルにメールアドレスが一致するユーザがなければ、新規登録として、User モデルと SocialAccount モデルに新規レコード作成
- User モデルにすでにユーザがあるが、SocialAccount モデルにレコードがなければ、SocailAccount モデルに新規レコード作成
- User モデル及び SocialAccount モデルにレコードがあれば、何もせず

以上の処理を行い、認証済みとする
