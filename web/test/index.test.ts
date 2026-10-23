import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import type { VueWrapper } from "@vue/test-utils"
import type { Mock } from "vitest"
import type { SendUrlResponse } from "../types/index.ts"

vi.mock("../app/composable/api.ts", () => ({
  default: {
    sendUrl: vi.fn(),
  },
}))

async function mountIndexPage() {
  const { default: IndexPage } = await import("../app/pages/index.vue")
  return mount(IndexPage, {
    attachTo: document.body,
  })
}

async function getApiMock() {
  const api = await import("../app/composable/api.ts")
  return vi.mocked(api.default.sendUrl)
}

beforeEach(() => {
  vi.clearAllMocks()
})

async function mockedFormRequest(
  id: string,
  url: string,
): Promise<{ sendUrl: Mock; wrapper: VueWrapper }> {
  const sendUrl = await getApiMock()
  const response: SendUrlResponse = { id, url }
  sendUrl.mockResolvedValueOnce(response)

  const wrapper = await mountIndexPage()
  await wrapper.find("input").setValue(url)
  await wrapper.find("form").trigger("submit")
  await vi.waitFor(() => expect(sendUrl).toHaveBeenCalledOnce())

  return {
    wrapper,
    sendUrl,
  }
}

describe("[UI.IndexPage] page structure", () => {
  it("[UI.IndexPage] presents the shortener as the page's main action", async () => {
    const wrapper = await mountIndexPage()

    expect(wrapper.find("main").exists()).toBe(true)
    expect(wrapper.text()).toContain("Long links, short names.")
    expect(wrapper.find("p").attributes("role")).toBe("status")
  })
})

describe("[UI.IndexPage] form submission", () => {
  it("[UI.IndexPage] calls api.sendUrl with the input value on form submit", async () => {
    const url = "https://example.com"
    const { sendUrl } = await mockedFormRequest("custom-id", url)

    expect(sendUrl).toHaveBeenCalledWith(url)
  })

  it("[UI.IndexPage] displays the confirmation message after shortening", async () => {
    const id = "abc123"
    const url = "https://example.com"

    const { wrapper } = await mockedFormRequest(id, url)
    expect(wrapper.find("p").text()).toBe(
      "Shortened https://example.com to abc123",
    )
  })

  it("[UI.IndexPage] displays the normalized url returned by the api", async () => {
    const sendUrl = await getApiMock()
    sendUrl.mockResolvedValueOnce({ id: "abc123", url: "https://google.com" })

    const wrapper = await mountIndexPage()
    await wrapper.find("input").setValue("google.com")
    await wrapper.find("form").trigger("submit")

    await vi.waitFor(() => {
      expect(wrapper.find("p").text()).toBe(
        "Shortened https://google.com to abc123",
      )
    })
  })

  it("[UI.IndexPage] displays an error message when the request fails", async () => {
    const sendUrl = await getApiMock()
    sendUrl.mockRejectedValueOnce(new Error("boom"))

    const wrapper = await mountIndexPage()
    await wrapper.find("input").setValue("https://example.com")
    await wrapper.find("form").trigger("submit")

    await vi.waitFor(() => {
      expect(wrapper.find("p").text()).toBe(
        "Could not shorten the url. Try again.",
      )
    })
  })
})
