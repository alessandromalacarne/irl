import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { ResolveUrlResponse, ShortenedUrl } from "../types/index.ts"

vi.mock("../server/service/shortener.ts", () => ({
  shortener: { resolve: vi.fn() },
  UrlNotFoundError: class UrlNotFoundError extends Error {},
}))

import handler from "../server/api/urls/[id].get.ts"
import { shortener, UrlNotFoundError } from "../server/service/shortener.ts"

const resolveMock = vi.mocked(shortener.resolve)

describe("[API.Resolve] GET /api/urls/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function callHandler(id?: string) {
    vi.mocked(globalThis.getRouterParam).mockReturnValueOnce(id)

    return handler(null)
  }

  it("[API.Resolve] returns the url stored under the route id", async () => {
    const shortened: ShortenedUrl = {
      id: "abc123",
      url: "https://example.com",
      createdAt: "2026-09-19T00:00:00.000Z",
    }
    resolveMock.mockResolvedValueOnce(shortened)

    const result = await callHandler("abc123") as ResolveUrlResponse

    expect(globalThis.getRouterParam).toHaveBeenCalledWith(null, "id")
    expect(resolveMock).toHaveBeenCalledWith("abc123")
    expect(result).toEqual({ id: "abc123", url: "https://example.com" })
  })

  it("[API.Resolve] responds 404 when the service cannot find the id", async () => {
    resolveMock.mockRejectedValueOnce(new UrlNotFoundError("Short url not found: unknown"))

    await expect(callHandler("unknown")).rejects.toMatchObject({ statusCode: 404 })
  })

  it("[API.Resolve] responds 400 when the id param is missing", async () => {
    await expect(callHandler(undefined)).rejects.toMatchObject({ statusCode: 400 })
    expect(resolveMock).not.toHaveBeenCalled()
  })

  it("[API.Resolve] maps unexpected service failures to a 500", async () => {
    const failure = new Error("boom")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    resolveMock.mockRejectedValueOnce(failure)

    await expect(callHandler("abc123")).rejects.toMatchObject({ statusCode: 500 })
    expect(consoleError).toHaveBeenCalledWith("Failed to resolve short url", failure)
  })
})
