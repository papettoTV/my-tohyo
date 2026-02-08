# ルートディレクトリ

my-tohyo/

# アプリケーション起動方法

## 1. データベースの起動

```shell
docker compose up -d
```

## 2. アプリケーション（統合版）の起動

今回の移行により、バックエンド機能は Next.js API Routes に統合されました。フロントエンドを起動するだけで、API も同時に利用可能になります。

```shell
cd src/frontend
npm install
npm run dev
```

- **URL**: `http://localhost:3000`
- **注意**: `src/frontend/.env.local` に必要な環境変数（DB情報、AI APIキー等）が設定されていることを確認してください。以前 `src/backend/.env.local` にあった変数はすべてこちらに集約されています。

## ポートが重複して起動できない場合

もし 3000 番ポートが占有されている場合は、以下のコマンドでプロセスを確認し、必要に応じて終了させてください。

```sh
lsof -i :3000
```

# その他
