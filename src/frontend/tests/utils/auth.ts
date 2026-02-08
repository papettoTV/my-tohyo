import { Page, expect } from "@playwright/test"

/**
 * テストログイン（認証バイパス）を使用してログインし、マイページへの遷移を確認する
 */
export async function loginAndNavigateToMyPage(page: Page) {
  // 1. ホーム画面へ
  await page.goto("/")

  // 2. ログイン画面へ遷移
  await page
    .getByRole("button", {
      name: "Googleでログイン",
    })
    .click()
  await page.waitForURL("login")

  // 3. ログイン
  await page.getByText("テストログイン (認証バイパス)")
  // 注意: NEXT_PUBLIC_ALLOW_TEST_AUTH=true が設定されている必要があります
  const testLoginButton = page.getByRole("button", {
    name: "テストログイン (認証バイパス)",
  })
  page.waitForURL(/\/(login\/callback|mypage)/)
  testLoginButton.click()

  // 4. mypageに遷移するまで待機
  await page.waitForURL((url) => url.pathname.includes("/mypage"))

  // 5. mypageの要素を確認
  await expect(page).toHaveURL(/\/mypage/)
  await expect(page.getByText("さん")).toBeVisible()
  await expect(page.getByText("過去の投票履歴")).toBeVisible()
}
