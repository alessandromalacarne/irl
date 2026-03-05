import { vi } from "vitest"

vi.stubGlobal("useRoute", vi.fn(() => ({ params: { id: "" } })))

vi.stubGlobal("navigateTo", vi.fn())

vi.stubGlobal("useRuntimeConfig", vi.fn(() => ({
  public: { apiUrl: "http://localhost:3000/" },
})))

