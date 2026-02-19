import { Page, expect } from "@playwright/test"

/**
 * テストログイン（認証バイパス）を使用してログインし、マイページへの遷移を確認する
 */
export async function loginAndNavigateToMyPage(page: Page) {
  // 1. ホーム画面へ
  await page.goto("/")

  // 2. ログイン画面へ遷移せずに直接テストログイン
  // 注意: NEXT_PUBLIC_ALLOW_TEST_AUTH=true が設定されている必要があります
  const testLoginButton = page.getByRole("button", {
    name: "テストログイン (認証バイパス)",
  })
  
  // 3. ログイン実行とmypageへの遷移待機
  await Promise.all([
    page.waitForURL((url) => url.pathname.includes("/mypage")),
    testLoginButton.click()
  ])

  // 5. mypageの要素を確認
  await expect(page).toHaveURL(/\/mypage/)
  await expect(page.getByText("さん")).toBeVisible()
  await expect(page.getByText("最近の投票")).toBeVisible()
}
