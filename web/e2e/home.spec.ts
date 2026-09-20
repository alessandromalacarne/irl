import { test, expect } from "@playwright/test"

test("[E2E.Home] renders the shortener form", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Irl" })).toBeVisible()
  await expect(page.getByPlaceholder("google.com")).toBeVisible()
  await expect(page.getByRole("button", { name: "Short it" })).toBeVisible()
})
