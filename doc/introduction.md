# ルートディレクト

my-tohyo/

# アプリケーション起動方法

## ローカル環境

### データベース起動方法

```shell
docker compose up -d
```

## アプリケーション起動方法

### frontend アプリケーション

```shell
cd src/frontend && npm run dev
```

### backend アプリケーション

```shell
cd src/backend && npm run live
```

#### port が重複して 3001 で起動できない場合

利用中の port を確認

```sh
for port in 3001 3002 3003; do echo "----- PORT :$port -----"; lsof -nP -iTCP:$port -sTCP:LISTEN; done
```

# その他
