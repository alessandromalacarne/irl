import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  esbuild: {
    tsconfigRaw: "{}",
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
})
