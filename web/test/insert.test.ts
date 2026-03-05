import { describe, it, expect, vi, beforeEach } from "vitest"
import handler from "../server/api/insert.post.ts";

describe("[API.Insert] POST /api/insert", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function callHandler(url: string) {
    const readBodyMock = vi.mocked(globalThis.readBody);
    readBodyMock.mockResolvedValueOnce({ url })

    return handler(null);
  }

  it("[API.Insert] returns an object with the submitted url", async () => {
    const result = await callHandler("https://example.com") as { id: string; url: string }
    expect(result.url).toBe("https://example.com")
  })

  it("[API.Insert] returns an id that is a 6-character string", async () => {
    const result = await callHandler("https://example.com") as { id: string; url: string }
    expect(typeof result.id).toBe("string")
    expect(result.id).toHaveLength(6)
  })

  it("[API.Insert] returns a different id on each invocation", async () => {
    const [a, b] = await Promise.all([
      callHandler("https://example.com"),
      callHandler("https://example.com"),
    ]) as [{ id: string }, { id: string }]
    expect(a.id).not.toBe(b.id)
  })

  it("[API.Insert] preserves the exact url from the request body", async () => {
    const url = "https://very-long-domain.example.org/path?q=1&r=2#anchor"
    const result = await callHandler(url) as { id: string; url: string }
    expect(result.url).toBe(url)
  })
})
