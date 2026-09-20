import { describe, it, expect, vi, beforeEach, afterAll } from "vitest"
import { mount } from "@vue/test-utils"
import axios, { AxiosError } from "axios"
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import type { ShortenedUrl } from "../types/index.ts"

const SHORT_ID = "abc123"
const USER_INPUT = "google.com"
const USER_URL = "https://google.com"

const state = vi.hoisted(() => ({
  stored: new Map<string, { id: string, url: string, createdAt: string }>(),
  requests: [] as { method: string, path: string, body?: unknown }[],
}))

vi.mock("nanoid", () => ({ nanoid: () => SHORT_ID }))

vi.mock("../server/repository/shortened.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../server/repository/shortened.ts")>()

  return {
    ...actual,
    createShortenedRepository: () => ({
      async create(item: ShortenedUrl): Promise<void> {
        state.stored.set(item.id, item)
      },
      async find(id: string): Promise<ShortenedUrl | null> {
        return state.stored.get(id) ?? null
      },
    }),
  }
})

import insertHandler from "../server/api/insert.post.ts"
import resolveHandler from "../server/api/urls/[id].get.ts"

const navigateToMock = vi.mocked(globalThis.navigateTo)

const originalAdapter = axios.defaults.adapter

function requestBody(data: unknown) {
  return typeof data === "string" ? JSON.parse(data) : data
}

async function dispatch(method: string, path: string, body: unknown) {
  const id = path.match(/^\/api\/urls\/(.+)$/)?.[1]

  if (method === "POST" && path === "/api/insert") {
    vi.mocked(globalThis.readBody).mockResolvedValueOnce(body)
    return insertHandler(null)
  }

  if (method === "GET" && id) {
    vi.mocked(globalThis.getRouterParam).mockReturnValueOnce(decodeURIComponent(id))
    return resolveHandler(null)
  }

  throw Object.assign(new Error(`Unhandled request: ${method} ${path}`), { statusCode: 404 })
}

function asAxiosError(error: unknown, config: InternalAxiosRequestConfig) {
  const { statusCode = 500, statusMessage = "Request failed" } = (error ?? {}) as {
    statusCode?: number
    statusMessage?: string
  }
  const response = {
    data: { message: statusMessage },
    status: statusCode,
    statusText: statusMessage,
    headers: {},
    config,
  } as AxiosResponse

  return new AxiosError(statusMessage, String(statusCode), config, null, response)
}

axios.defaults.adapter = async (config) => {
  const method = (config.method ?? "get").toUpperCase()
  const path = new URL(config.url as string).pathname
  const body = requestBody(config.data)

  if (body === undefined) {
    state.requests.push({ method, path })
  } else {
    state.requests.push({ method, path, body })
  }

  try {
    const data = await dispatch(method, path, body)
    return { data, status: 200, statusText: "OK", headers: {}, config } as AxiosResponse
  } catch (error) {
    throw asAxiosError(error, config)
  }
}

async function openHomePage() {
  const { default: IndexPage } = await import("../app/pages/index.vue")
  return mount(IndexPage, { attachTo: document.body })
}

async function openShortUrl(id: string) {
  vi.stubGlobal("useRoute", vi.fn(() => ({ params: { id } })))

  const { default: RedirectPage } = await import("../app/pages/[id].vue")
  return mount(RedirectPage)
}

describe("[E2E.Shorten] visitor journey", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    state.stored.clear()
    state.requests.length = 0
  })

  afterAll(() => {
    axios.defaults.adapter = originalAdapter
  })

  it("[E2E.Shorten] shortens the bare host a visitor submits and redirects whoever opens the short link", async () => {
    const home = await openHomePage()

    await home.find("input").setValue(USER_INPUT)
    await home.find("button").trigger("click")

    await vi.waitFor(() => expect(home.find("p").text()).not.toBe(""))
    expect(home.find("p").text()).toBe(`Shortened ${USER_URL} to ${SHORT_ID}`)

    const redirect = await openShortUrl(SHORT_ID)

    await vi.waitFor(() => expect(navigateToMock).toHaveBeenCalledOnce())
    expect(redirect.find("p").text()).toBe("Redirecting...")
    expect(navigateToMock).toHaveBeenCalledWith(USER_URL, { external: true })
    expect(state.requests).toEqual([
      { method: "POST", path: "/api/insert", body: { url: USER_INPUT } },
      { method: "GET", path: `/api/urls/${SHORT_ID}` },
    ])
  })
})
