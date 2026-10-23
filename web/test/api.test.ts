import { describe, it, expect, vi, beforeEach } from "vitest"
import type { AxiosResponse } from "axios"
import axios from "axios"
import type { ResolveUrlResponse, SendUrlResponse } from "../types/index.ts"
import api from "../app/composable/api.ts"

vi.mock("axios")

const postMock = vi.mocked(axios.post)
const getMock = vi.mocked(axios.get)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("[Composable.Api] sendUrl", () => {
  it("[Composable.Api] posts the url and returns the response body", async () => {
    const body: SendUrlResponse = {
      id: "abc123",
      url: "https://example.com",
    }
    postMock.mockResolvedValueOnce({ data: body } as AxiosResponse)

    await expect(api.sendUrl("example.com")).resolves.toEqual(body)
    expect(postMock).toHaveBeenCalledWith("http://localhost:3000/api/insert", {
      url: "example.com",
    })
  })
})

describe("[Composable.Api] resolveUrl", () => {
  it("[Composable.Api] gets the short id and returns the response body", async () => {
    const body: ResolveUrlResponse = {
      id: "abc123",
      url: "https://example.com",
    }
    getMock.mockResolvedValueOnce({ data: body } as AxiosResponse)

    await expect(api.resolveUrl("abc123")).resolves.toEqual(body)
    expect(getMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/urls/abc123",
    )
  })
})
