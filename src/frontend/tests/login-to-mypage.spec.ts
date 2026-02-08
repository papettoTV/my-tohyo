import { test, expect } from "@playwright/test"
import { loginAndNavigateToMyPage } from "./utils/auth"

test("ホーム画面からGoogleログインし、mypageに遷移できる", async ({ page }) => {
  await loginAndNavigateToMyPage(page)
})
