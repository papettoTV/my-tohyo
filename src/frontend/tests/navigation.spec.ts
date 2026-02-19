import { test, expect } from "@playwright/test"

test("利用規約ページに遷移できること", async ({ page }) => {
  await page.goto("/")

  // フッターの利用規約リンクをクリック
  await page.getByRole("link", { name: "利用規約" }).click()

  // URLが変更されたことを確認
  await expect(page).toHaveURL(/\/terms/)

  // ページのタイトルや見出しを確認
  await expect(
    page.getByRole("heading", { name: "利用規約", exact: true }),
  ).toBeVisible()
})

test("マイページ（ログイン前）にアクセスしようとするとログイン画面にリダイレクトされること", async ({
  page,
}) => {
  // 直接マイページにアクセス
  await page.goto("/mypage")

  // ログイン画面にリダイレクトされることを確認
  await expect(page).toHaveURL(/\/login/)
  await expect(
    page.getByText("ログイン", { exact: true }).first(),
  ).toBeVisible()
})
