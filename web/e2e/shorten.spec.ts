import { test, expect } from "@playwright/test"

const USER_INPUT = "example.com"
const USER_URL = "https://example.com"

test.describe("[E2E.Shorten] visitor journey", () => {
  test("shortens the bare host a visitor submits and redirects whoever opens the short link", async ({ page }) => {
    await page.route(/^https:\/\/example\.com\//, (route) => route.fulfill({ body: "landed" }))

    await page.goto("/")
    await page.waitForFunction(() => (window as any).useNuxtApp?.().isHydrating === false)

    await page.getByPlaceholder("google.com").fill(USER_INPUT)
    await page.getByRole("button", { name: "Short it" }).click()

    const output = page.locator("p")
    await expect(output).toContainText(`Shortened ${USER_URL} to `)

    const id = (await output.textContent())!.split(" to ").pop()!
    expect(id).toMatch(/^[\w-]+$/)

    await page.goto(`/${id}`)

    await expect(page).toHaveURL(`${USER_URL}/`)
    await expect(page.locator("body")).toHaveText("landed")
  })
})
