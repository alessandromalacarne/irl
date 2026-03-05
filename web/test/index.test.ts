import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
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

describe("[UI.IndexPage] POST requisition and localStorage writing", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  async function mockedFormRequest(id: string, url: string): Promise<{ sendUrl: any, wrapper: any }> {
    const sendUrl = await getApiMock()
    const response: SendUrlResponse = { id, url }
    sendUrl.mockResolvedValueOnce(response)

    const wrapper = await mountIndexPage()
    await wrapper.find("input").setValue(url)
    await wrapper.find("form").trigger("submit")
    await vi.waitFor(() => expect(sendUrl).toHaveBeenCalledOnce())

    return {
      wrapper,
      sendUrl
    }
  }

  it("[UI.IndexPage] calls api.sendUrl with the input value on form submit", async () => {
    const url = "https://example.com";
    const { sendUrl } = await mockedFormRequest("custom-id", url);

    expect(sendUrl).toHaveBeenCalledWith(url);
  })

  it("[UI.IndexPage] stores id → url in localStorage after a successful API response", async () => {
    const id = "abc123";
    const url = "https://example.com";

    await mockedFormRequest(id, url);
    expect(localStorage.getItem(id)).toBe(url);
  })

  it("[UI.IndexPage] displays the confirmation message after shortening", async () => {
    const id = "abc123";
    const url = "https://example.com";

    const { wrapper } = await mockedFormRequest(id, url);
    expect(wrapper.find("p").text()).toBe("Shortened https://example.com to abc123")
  })
})
