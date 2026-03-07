import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    include: ["infra/test/**/*.test.ts"],
    environment: "node",
  },
})
