# E2E テストガイド (Playwright)

MyTohyo プロジェクトでは、Playwright を使用してフロントエンドの E2E (End-to-End) テストを実施しています。

## 1. 事前準備

### Node.js のインストール
依存パッケージのインストールが必要です。フロントエンドディレクトリで以下を実行してください。

```bash
cd src/frontend
npm install
```

### ブラウザのインストール
Playwright が使用するブラウザをインストールします。

```bash
npx playwright install chromium
```

### 環境変数の設定
テストログイン（認証バイパス）を有効にするために、`src/frontend/.env.local` に以下の設定が必要です。

```env
NEXT_PUBLIC_ALLOW_TEST_AUTH=true
```

## 2. テストの実行

### 全てのテストを実行
フロントエンドディレクトリ (`src/frontend`) で実行します。

```bash
npx playwright test
```

### 特定のテストファイルを指定して実行
```bash
npx playwright test tests/smoke.spec.ts
```

### UI モードで実行 (デバッグに便利)
ブラウザの動きを確認しながらテストを実行できます。

```bash
npx playwright test --ui
```

## 3. 実装されているテストケース

現在、以下のテストが `src/frontend/tests` に実装されています。

- **`smoke.spec.ts`**: ホーム画面の基本表示確認。
- **`navigation.spec.ts`**: ページ遷移の確認。リファクタリングにより `tests/utils/auth.ts` の共通ログイン処理を使用しています。
- **`vote-record.spec.ts`**: 投票記録のライフサイクル確認（登録、マイページ/一覧での表示、詳細、削除）。`tests/utils/auth.ts` の共通ログイン処理を使用しています。

### 5. テスト用ユーティリティ

- **`tests/utils/auth.ts`**: `loginAndNavigateToMyPage` 関数を提供します。テストログインボタンを使用して認証し、マイページが正しく読み込まれるまで待機する共通ロジックが実装されています。

## 4. レポートの確認

テスト失敗時、Playwright は自動的にスクリーンショットとビデオを記録します。
詳細なレポートは以下のコマンドで確認できます：

```bash
npx playwright show-report
```

レポートファイルは `src/frontend/playwright-report` に生成されます。
また、失敗した各テストの詳細は `src/frontend/test-results` ディレクトリにも保存されます。
