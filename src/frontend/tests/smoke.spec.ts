import { test, expect } from "@playwright/test"

test("ホーム画面が正しく表示されること", async ({ page }) => {
  await page.goto("/")

  // ページの読み込みを待機
  await page.waitForLoadState("networkidle")

  // タイトルの確認
  await expect(page).toHaveTitle(/MyTohyo/)
  
  // メインの見出しを確認 (正規表現でより柔軟に)
  await expect(page.getByRole("heading", { name: /MyTohyo/i })).toBeVisible()
  
  // ログインボタンが存在することを確認
  await expect(page.getByRole("button", { name: /ログイン|Googleでログイン/i })).toBeVisible()
  
  // 特徴カードが表示されていることを確認
  await expect(page.getByText("投票記録管理")).toBeVisible()
  await expect(page.getByText("プライバシー保護")).toBeVisible()
  await expect(page.getByText("政治参加促進")).toBeVisible()
})
