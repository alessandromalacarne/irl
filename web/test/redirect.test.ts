import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"

const navigateToMock = vi.mocked(globalThis.navigateTo)

async function mountRedirectPage(id: string) {
  // Mock process.client to mimic a client-side environment
  vi.stubGlobal("process", { ...process, client: true })
  vi.stubGlobal("useRoute", vi.fn(() => ({ params: { id } })))

  const { default: RedirectPage } = await import("../app/pages/[id].vue")
  return mount(RedirectPage)
}

describe("[UI.RedirectPage] redirect logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("[UI.RedirectPage] calls navigateTo with the stored url when the id exists in localStorage", async () => {
    localStorage.setItem("abc123", "https://example.com")

    await mountRedirectPage("abc123")

    expect(navigateToMock).toHaveBeenCalledOnce()
    expect(navigateToMock).toHaveBeenCalledWith("https://example.com", { external: true })
  })

  it("[UI.RedirectPage] calls navigateTo with null when the id is not in localStorage", async () => {
    // localStorage has no entry for this id
    await mountRedirectPage("unknown")

    expect(navigateToMock).toHaveBeenCalledOnce()
    expect(navigateToMock).toHaveBeenCalledWith(null, { external: true })
  })

  it("[UI.RedirectPage] uses the id from the route params as the localStorage key", async () => {
    localStorage.setItem("xyz999", "https://other-site.org/page")

    await mountRedirectPage("xyz999")

    expect(navigateToMock).toHaveBeenCalledWith("https://other-site.org/page", { external: true })
  })

  it("[UI.RedirectPage] does not redirect to the url of a different id", async () => {
    localStorage.setItem("aaaa11", "https://site-a.com")
    localStorage.setItem("bbbb22", "https://site-b.com")

    await mountRedirectPage("aaaa11")

    expect(navigateToMock).not.toHaveBeenCalledWith("https://site-b.com", expect.anything())
  })
})
