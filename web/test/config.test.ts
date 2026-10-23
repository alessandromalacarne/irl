import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const ENV_KEYS = ["SHORTENED_TABLE_NAME", "DYNAMODB_ENDPOINT", "AWS_REGION"]
const original = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
)

function clearEnv() {
  for (const key of ENV_KEYS) {
    delete process.env[key]
  }
}

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = original[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

beforeEach(() => {
  vi.resetModules()
  clearEnv()
})

afterEach(() => {
  restoreEnv()
})

describe("[Config] defaults", () => {
  it("[Config] falls back to the shortened table and us-east-1", async () => {
    const config = await import("../server/config.ts")

    expect(config.TABLE_NAME).toBe("shortened")
    expect(config.DYNAMODB_ENDPOINT).toBeUndefined()
    expect(config.AWS_REGION).toBe("us-east-1")
  })
})

describe("[Config] environment overrides", () => {
  it("[Config] reads the table, endpoint and region from the environment", async () => {
    process.env.SHORTENED_TABLE_NAME = "custom"
    process.env.DYNAMODB_ENDPOINT = "http://localhost:8000"
    process.env.AWS_REGION = "sa-east-1"

    const config = await import("../server/config.ts")

    expect(config.TABLE_NAME).toBe("custom")
    expect(config.DYNAMODB_ENDPOINT).toBe("http://localhost:8000")
    expect(config.AWS_REGION).toBe("sa-east-1")
  })
})
