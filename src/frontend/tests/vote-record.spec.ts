import { test, expect } from "@playwright/test"
import { loginAndNavigateToMyPage } from "./utils/auth"

test.describe("投票記録のライフサイクル", () => {
  test.beforeEach(async ({ page }) => {
    // 共通のログイン・ナビゲーション処理を使用
    await loginAndNavigateToMyPage(page)
  })

  test("投票記録を登録し、詳細を確認後に削除できること", async ({ page }) => {
    // 1. 登録ページへ遷移
    const registerLink = page.getByRole("link", { name: "投票記録登録" })
    // await registerLink.waitFor({ state: "visible", timeout: 20000 })
    // await Promise.all([
    // page.waitForURL(/\/register/, { timeout: 20000 })
    registerLink.click()
    // ])
    await expect(page).toHaveURL(/\/register/)

    // 2. フォームの入力
    await page.getByLabel("選挙の種類").click()
    await page.getByRole("option").first().click()
    await page.getByLabel("選挙名").fill("テスト自動選挙 2026")
    await page.getByLabel("政党名").click()
    await page.getByRole("option").first().click()
    await page.getByLabel("候補者名（小選挙区の場合）").fill("テスト 太郎")
    await page
      .getByLabel("メモ（任意）")
      .fill("Playwrightによる自動テストの記録です。")

    // 3. 登録実行
    await page.getByRole("button", { name: "登録する" }).click()

    // 4. 詳細ページへのリダイレクト確認
    await page.waitForURL(/\/history\/\d+/)
    const detailUrl = page.url()
    await expect(page.getByText("投票履歴詳細")).toBeVisible()
    await expect(page.getByText("テスト自動選挙 2026").first()).toBeVisible()

    // 4.5 履歴一覧での表示確認
    await page.goto("/history")
    await page.waitForResponse((response) => {
      return (
        response.url().includes("/api/vote-records") &&
        response.status() === 200
      )
    })
    // await page.waitForURL("/history")

    await expect(page.getByText("テスト自動選挙 2026").first()).toBeVisible()

    // 4.6 マイページでの表示確認
    await page.goto("/mypage")
    // await page.waitForResponse((response) => {
    //   return response.url().includes("/api/vote-records") && response.status() === 200
    // })
    await expect(page.getByText("テスト自動選挙 2026").first()).toBeVisible()

    // 5. 削除の実行 (詳細ページに戻る)
    await page.goto(detailUrl)
    await page.getByRole("button", { name: "この投票履歴を削除" }).click()

    // 確認ダイアログ
    await expect(page.getByText("本当に削除しますか？")).toBeVisible()
    await page.getByRole("button", { name: "削除する" }).click()

    // 6. 履歴一覧ページへのリダイレクト確認 (末尾が /history であることを厳密にチェック)
    await page.waitForURL((url) => url.pathname === "/history", {
      timeout: 10000,
    })
    await page.reload()

    // 削除したレコードが一覧にないことを確認
    await expect(page.getByText("テスト自動選挙 2026")).not.toBeVisible()
  })
})
