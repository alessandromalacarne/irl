import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import type { SendUrlResponse } from "../types/index.ts"

vi.mock("../server/service/shortener.ts", () => ({
  shortener: { shorten: vi.fn() },
}))

import handler from "../server/api/insert.post.ts"
import { shortener } from "../server/service/shortener.ts"

const shortenMock = vi.mocked(shortener.shorten)

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

describe("[API.Insert] normalization", () => {
  it("[API.Insert] prepends https to a url that has no scheme", async () => {
    const response: SendUrlResponse = {
      id: "abc123",
      url: "https://google.com",
    }
    shortenMock.mockResolvedValueOnce(response)

    const result = (await callHandler({ url: "google.com" })) as SendUrlResponse

    expect(shortenMock).toHaveBeenCalledWith("https://google.com")
    expect(result).toEqual(response)
  })

  it("[API.Insert] trims whitespace around the submitted url", async () => {
    shortenMock.mockResolvedValueOnce({
      id: "abc123",
      url: "https://example.com",
    })

    await callHandler({ url: "  https://example.com  " })

    expect(shortenMock).toHaveBeenCalledWith("https://example.com")
  })
})

describe("[API.Insert] host forms", () => {
  it("[API.Insert] keeps the port of a bare host", async () => {
    shortenMock.mockResolvedValueOnce({ id: "abc123", url: "" })

    await callHandler({ url: "example.com:8080" })

    expect(shortenMock).toHaveBeenCalledWith("https://example.com:8080")
  })

  it("[API.Insert] keeps the path of a bare host", async () => {
    shortenMock.mockResolvedValueOnce({ id: "abc123", url: "" })

    await callHandler({ url: "example.com/path" })

    expect(shortenMock).toHaveBeenCalledWith("https://example.com/path")
  })

  it("[API.Insert] accepts a query that embeds a scheme", async () => {
    shortenMock.mockResolvedValueOnce({ id: "abc123", url: "" })

    await callHandler({ url: "example.com?next=http://x" })

    expect(shortenMock).toHaveBeenCalledWith(
      "https://example.com?next=http://x",
    )
  })

  it("[API.Insert] accepts a multi-label host", async () => {
    shortenMock.mockResolvedValueOnce({ id: "abc123", url: "" })

    await callHandler({ url: "sub.example.co.uk" })

    expect(shortenMock).toHaveBeenCalledWith("https://sub.example.co.uk")
  })

  it("[API.Insert] accepts an http url unchanged", async () => {
    shortenMock.mockResolvedValueOnce({ id: "abc123", url: "" })

    await callHandler({ url: "http://example.com" })

    expect(shortenMock).toHaveBeenCalledWith("http://example.com")
  })
})

describe("[API.Insert] validation", () => {
  it("[API.Insert] rejects a request without a url", async () => {
    await expect(callHandler({})).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "A valid url is required",
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a request without a body", async () => {
    await expect(callHandler(undefined)).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a blank url", async () => {
    await expect(callHandler({ url: "   " })).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a url that is not a string", async () => {
    await expect(callHandler({ url: 42 })).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })
})

describe("[API.Insert] rejections", () => {
  it("[API.Insert] rejects a url that is not parseable", async () => {
    await expect(
      callHandler({ url: "https://not a url" }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a scheme-less value that is not a host", async () => {
    await expect(callHandler({ url: "not-a-url" })).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a host preceded by other text", async () => {
    await expect(callHandler({ url: "x example.com" })).rejects.toMatchObject({
      statusCode: 400,
    })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a scheme that is not http or https", async () => {
    await expect(
      callHandler({ url: "ftp://example.com" }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a javascript url", async () => {
    await expect(
      callHandler({ url: "javascript:alert(1)" }),
    ).rejects.toMatchObject({ statusCode: 400 })
    expect(shortenMock).not.toHaveBeenCalled()
  })

  it("[API.Insert] rejects a port that is not numeric", async () => {
    await expect(callHandler({ url: "example.com:abc" })).rejects.toMatchObject(
      { statusCode: 400 },
    )
    expect(shortenMock).not.toHaveBeenCalled()
  })
})

describe("[API.Insert] service delegation", () => {
  it("[API.Insert] shortens the submitted url through the service", async () => {
    const response: SendUrlResponse = {
      id: "abc123",
      url: "https://example.com",
    }
    shortenMock.mockResolvedValueOnce(response)

    const result = (await callHandler({
      url: "https://example.com",
    })) as SendUrlResponse

    expect(shortenMock).toHaveBeenCalledWith("https://example.com")
    expect(result).toEqual(response)
  })

  it("[API.Insert] maps unexpected service failures to a 500", async () => {
    const failure = new Error("boom")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    shortenMock.mockRejectedValueOnce(failure)

    await expect(
      callHandler({ url: "https://example.com" }),
    ).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: "Could not shorten the url",
    })
    expect(consoleError).toHaveBeenCalledWith("Failed to shorten url", failure)
  })
})
