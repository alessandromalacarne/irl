import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"

vi.mock("../app/composable/api.ts", () => ({
  default: {
    resolveUrl: vi.fn(),
  },
}))

const navigateToMock = vi.mocked(globalThis.navigateTo)

async function getApiMock() {
  const api = await import("../app/composable/api.ts")
  return vi.mocked(api.default.resolveUrl)
}

async function mountRedirectPage(id: string) {
  vi.stubGlobal("useRoute", vi.fn(() => ({ params: { id } })))

  const { default: RedirectPage } = await import("../app/pages/[id].vue")
  return mount(RedirectPage)
}

function notFoundError() {
  return Object.assign(new Error("Not Found"), {
    isAxiosError: true,
    response: { status: 404 },
  })
}

describe("[UI.RedirectPage] resolve and redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("[UI.RedirectPage] navigates to the url resolved for the route id", async () => {
    const resolveUrl = await getApiMock()
    resolveUrl.mockResolvedValueOnce({ id: "abc123", url: "https://example.com" })

    await mountRedirectPage("abc123")

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledOnce())
    expect(resolveUrl).toHaveBeenCalledWith("abc123")
    expect(navigateToMock).toHaveBeenCalledWith("https://example.com", { external: true })
  })

  it("[UI.RedirectPage] shows a not found message after a 404 without navigating", async () => {
    const resolveUrl = await getApiMock()
    resolveUrl.mockRejectedValueOnce(notFoundError())

    const wrapper = await mountRedirectPage("unknown")

    await vi.waitFor(() => expect(wrapper.find("p").text()).toBe("Short url not found."))
    expect(navigateToMock).not.toHaveBeenCalled()
  })

  it("[UI.RedirectPage] shows a generic failure message on other errors", async () => {
    const resolveUrl = await getApiMock()
    resolveUrl.mockRejectedValueOnce(new Error("network down"))

    const wrapper = await mountRedirectPage("abc123")

    await vi.waitFor(() => {
      expect(wrapper.find("p").text()).toBe("Could not resolve the short url. Try again.")
    })
    expect(navigateToMock).not.toHaveBeenCalled()
  })
})
