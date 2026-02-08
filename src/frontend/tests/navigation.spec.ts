import { test, expect } from "@playwright/test"

test("利用規約ページに遷移できること", async ({ page }) => {
  await page.goto("/")

  // 利用規約ボタンをクリック
  await page.getByRole("link", { name: "利用規約" }).click()

  // URLが変更されたことを確認
  await expect(page).toHaveURL(/\/terms/)

  // ページのタイトルや見出しを確認
  await expect(
    page.getByRole("heading", { name: "利用規約", exact: true }),
  ).toBeVisible()
})

test("マイページ（ログイン前）に遷移しようとするとログイン画面にリダイレクトされること", async ({
  page,
}) => {
  await page.goto("/")

  // マイページボタンをクリック
  await page.getByRole("link", { name: "マイページ" }).click()

  // ログイン画面にリダイレクトされることを確認
  await expect(page).toHaveURL(/\/login/)
  await expect(
    page.getByText("ログイン", { exact: true }).first(),
  ).toBeVisible()
})
