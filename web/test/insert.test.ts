import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { SendUrlResponse } from "../types/index.ts"

vi.mock("../server/service/shortener.ts", () => ({
  shortener: { shorten: vi.fn() },
}))

import handler from "../server/api/insert.post.ts"
import { shortener } from "../server/service/shortener.ts"

const shortenMock = vi.mocked(shortener.shorten)

describe("[API.Insert] POST /api/insert", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function callHandler(body: unknown) {
    const readBodyMock = vi.mocked(globalThis.readBody)
    readBodyMock.mockResolvedValueOnce(body)

    return handler(null)
  }

  it("[API.Insert] shortens the submitted url through the service", async () => {
    const response: SendUrlResponse = { id: "abc123", url: "https://example.com" }
    shortenMock.mockResolvedValueOnce(response)

    const result = await callHandler({ url: "https://example.com" }) as SendUrlResponse

    expect(shortenMock).toHaveBeenCalledWith("https://example.com")
    expect(result).toEqual(response)
  })

  it("[API.Insert] rejects a request without a url", async () => {
    await expect(callHandler({})).rejects.toMatchObject({ statusCode: 400 })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a url that is not parseable", async () => {
    await expect(callHandler({ url: "not-a-url" })).rejects.toMatchObject({ statusCode: 400 })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] maps unexpected service failures to a 500", async () => {
    const failure = new Error("boom")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    shortenMock.mockRejectedValueOnce(failure)

    await expect(callHandler({ url: "https://example.com" })).rejects.toMatchObject({ statusCode: 500 })
    expect(consoleError).toHaveBeenCalledWith("Failed to shorten url", failure)
  })
})
