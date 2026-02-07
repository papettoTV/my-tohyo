import { test, expect } from "@playwright/test"

test("ホーム画面からGoogleログインし、mypageに遷移できる", async ({ page }) => {
  // 1. ホーム画面へ
  await page.goto("/")

  // 2. ログインボタンをクリック
  // ボタンのテキストやdata-testid等に応じて適宜修正
  await page.getByRole("button", { name: /ログイン|Googleでログイン/i }).click()

  // 3. テストログイン（認証バイパス）ボタンをクリック
  // 注意: NEXT_PUBLIC_ALLOW_TEST_AUTH=true が設定されている必要があります
  await page.getByRole("button", { name: "テストログイン (認証バイパス)" }).click()

  // 4. mypageに遷移するまで待機
  await page.waitForURL("/mypage", { timeout: 10000 })

  // 5. mypageの要素を確認
  await expect(page).toHaveURL(/\/mypage/)
  await expect(page.getByText("さん")).toBeVisible()
  await expect(page.getByText("過去の投票履歴")).toBeVisible()
})
