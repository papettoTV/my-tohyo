import { test, expect } from "@playwright/test"

test("ホーム画面からGoogleログインし、mypageに遷移できる", async ({ page }) => {
  // 1. ホーム画面へ
  await page.goto("/")

  // 2. ログインボタンをクリック
  // ボタンのテキストやdata-testid等に応じて適宜修正
  await page.getByRole("button", { name: /ログイン|Googleでログイン/i }).click()

  // 3. Googleアカウント選択画面で "aegfrompsbt@gmail.com" を選択
  // ここはGoogleのログイン画面の自動化が必要
  // もし2段階認証やCAPTCHAがある場合は、Playwrightの公式ドキュメントに従い
  // 事前にGoogleアカウントのcookie/sessionをセットする方法を推奨
  // 例: https://playwright.dev/docs/auth#google-authentication

  // ここでは一旦、Googleログイン画面の自動化はスキップし、手動でcookieをセットする前提
  // await page.getByText("aegfrompsbt@gmail.com").click()
  // await page.fill('input[type="email"]', "aegfrompsbt@gmail.com")
  // await page.fill('input[type="password"]', "your-password")
  // await page.click('button:has-text("次へ")')

  // 4. mypageに遷移するまで待機
  await page.waitForURL("/mypage", { timeout: 10000 })

  // 5. mypageの要素を確認（例: ユーザー名や特定のテキストが表示されているか）
  await expect(page).toHaveURL(/\/mypage/)
  await expect(page.getByText(/マイページ|mypage/i)).toBeVisible()
})
