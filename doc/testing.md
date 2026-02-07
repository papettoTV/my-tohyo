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

- **`smoke.spec.ts`**: ホーム画面の基本表示確認。タイトル、見出し、主要ボタンの存在を確認します。
- **`navigation.spec.ts`**: ページ遷移の確認。
    - 利用規約ページへの遷移。
    - 未ログイン状態でのマイページアクセス時のログイン画面リダイレクト。
- **`login-to-mypage.spec.ts`**: ログインフローの確認。テストログインボタンを使用し、マイページへ正常に遷移できるかを確認します。

## 4. レポートの確認

テスト失敗時、Playwright は自動的にスクリーンショットとビデオを記録します。
詳細なレポートは以下のコマンドで確認できます：

```bash
npx playwright show-report
```

レポートファイルは `src/frontend/playwright-report` に生成されます。
また、失敗した各テストの詳細は `src/frontend/test-results` ディレクトリにも保存されます。
