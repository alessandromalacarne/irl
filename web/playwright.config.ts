import { defineConfig, devices } from "@playwright/test"

const port = Number(process.env.E2E_PORT ?? 3100)
const baseURL = `http://localhost:${port}`

const dynamodbEndpoint = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000"
const dynamodbPort = new URL(dynamodbEndpoint).port
const dynamodbCommand = process.env.DYNAMODB_COMMAND ??
  `podman run --rm -p ${dynamodbPort}:8000 amazon/dynamodb-local`

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: dynamodbCommand,
      url: dynamodbEndpoint,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run dev -- --port ${port}`,
      url: baseURL,
      reuseExistingServer: false,
      env: {
        API_URL: `${baseURL}/`,
        DYNAMODB_ENDPOINT: dynamodbEndpoint,
        AWS_REGION: process.env.AWS_REGION ?? "us-east-1",
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ?? "local",
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ?? "local",
      },
    },
  ],
})
