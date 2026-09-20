import { describe, it, expect, vi } from "vitest"
import type { ShortenedUrl } from "../types/index.ts"
import { createShortener, UrlNotFoundError } from "../server/service/shortener"
import { IdAlreadyExistsError } from "../server/repository/shortened"
import type { ShortenedRepository } from "../server/repository/shortened"

class FakeRepository implements ShortenedRepository {
  items = new Map<string, ShortenedUrl>()
  taken = new Set<string>()
  failure: Error | null = null

  async create(item: ShortenedUrl): Promise<void> {
    if (this.failure) {
      throw this.failure
    }

    if (this.taken.has(item.id) || this.items.has(item.id)) {
      throw new IdAlreadyExistsError(`Short id already exists: ${item.id}`)
    }

    this.items.set(item.id, item)
  }

  async find(id: string): Promise<ShortenedUrl | null> {
    return this.items.get(id) ?? null
  }
}

function generateIds(...values: string[]) {
  return vi.fn(() => values.shift() as string)
}

describe("[Service.Shortener] shorten and resolve", () => {
  it("[Service.Shortener] shorten persists the url under a generated id", async () => {
    const repository = new FakeRepository()
    const shortener = createShortener(repository, generateIds("abc123"))

    await expect(shortener.shorten("https://example.com")).resolves.toEqual({
      id: "abc123",
      url: "https://example.com",
    })

    const stored = repository.items.get("abc123")
    expect(stored?.url).toBe("https://example.com")
    expect(stored?.createdAt).toEqual(expect.any(String))
  })

  it("[Service.Shortener] shorten retries with a new id when the generated one is taken", async () => {
    const repository = new FakeRepository()
    repository.taken.add("taken1")
    const shortener = createShortener(repository, generateIds("taken1", "fresh1"))

    await expect(shortener.shorten("https://example.com")).resolves.toEqual({
      id: "fresh1",
      url: "https://example.com",
    })
    expect(repository.items.has("fresh1")).toBe(true)
  })

  it("[Service.Shortener] shorten gives up after three collisions", async () => {
    const repository = new FakeRepository()
    repository.taken.add("taken1")
    const generateId = generateIds("taken1", "taken1", "taken1")
    const shortener = createShortener(repository, generateId)

    await expect(shortener.shorten("https://example.com")).rejects.toThrow("unique id")
    expect(generateId).toHaveBeenCalledTimes(3)
  })

  it("[Service.Shortener] shorten rethrows repository failures that are not collisions", async () => {
    const repository = new FakeRepository()
    const failure = new Error("boom")
    repository.failure = failure
    const shortener = createShortener(repository, generateIds("abc123"))

    await expect(shortener.shorten("https://example.com")).rejects.toBe(failure)
  })

  it("[Service.Shortener] resolve returns the stored shortened url", async () => {
    const repository = new FakeRepository()
    await repository.create({
      id: "abc123",
      url: "https://example.com",
      createdAt: "2026-09-19T00:00:00.000Z",
    })
    const shortener = createShortener(repository)

    await expect(shortener.resolve("abc123")).resolves.toEqual({
      id: "abc123",
      url: "https://example.com",
      createdAt: "2026-09-19T00:00:00.000Z",
    })
  })

  it("[Service.Shortener] resolve throws UrlNotFoundError for an unknown id", async () => {
    const shortener = createShortener(new FakeRepository())

    await expect(shortener.resolve("unknown")).rejects.toBeInstanceOf(UrlNotFoundError)
  })
})
