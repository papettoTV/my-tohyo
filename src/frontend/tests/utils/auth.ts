import { Page, expect } from "@playwright/test";

/**
 * テストログイン（認証バイパス）を使用してログインし、マイページへの遷移を確認する
 */
export async function loginAndNavigateToMyPage(page: Page) {
  console.log("Navigating to /login...");
  await page.goto("/login");
  
  // すでにログインしている可能性があるため、ログアウトボタンがあればクリック（任意）
  // ここではシンプルに /login からスタート
  
  // テストログインボタンをクリックし、ナビゲーションを待機
  console.log("Clicking test login button and waiting for navigation...");
  try {
    await Promise.all([
      page.waitForURL("**/login/callback*", { timeout: 20000 }),
      page.getByRole("button", { name: "テストログイン (認証バイパス)" }).click(),
    ]);
  } catch (e) {
    console.warn("Failed to wait for /login/callback, checking if already on /mypage or stuck...");
  }

  // マイページに遷移することを確認
  console.log("Waiting for /mypage...");
  await page.waitForURL(url => url.pathname.includes("/mypage"), { timeout: 30000 });
  
  // ページの内容が読み込まれるのを待機
  console.log("Waiting for content to be visible...");
  // "さん" が表示されるまで十分に待機
  const userNameText = page.getByText("さん").first();
  await expect(userNameText).toBeVisible({ timeout: 20000 });
}
