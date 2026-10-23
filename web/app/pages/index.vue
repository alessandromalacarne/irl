<script setup lang="ts">
import { ref } from "vue"
import api from '../composable/api.ts'
import type { SendUrlResponse } from '../../types.ts'

const userUrl = ref('');
const output = ref('');
const failed = ref(false);

const clickShort = async () => {
  try {
    const response: SendUrlResponse = await api.sendUrl(userUrl.value);
    output.value = `Shortened ${response.url} to ${response.id}`;
    failed.value = false;
  } catch {
    output.value = 'Could not shorten the url. Try again.';
    failed.value = true;
  }
};

</script>

<template>
  <main class="shell">
    <header class="masthead">
      <h1 class="wordmark">Irl</h1>
      <span class="kicker"><span class="kicker-arrow" aria-hidden="true">↳</span> URL shortener</span>
    </header>

    <section class="hero" aria-labelledby="hero-title">
      <h2 id="hero-title" class="headline"><span>Long links,</span> <span>short names.</span></h2>
      <div class="lede">Paste a URL. Get a short link you can say out loud.</div>

      <form class="shortener" @submit.prevent="clickShort">
        <label class="visually-hidden" for="url-input">URL to shorten</label>
        <input
          id="url-input"
          v-model="userUrl"
          name="url"
          type="text"
          inputmode="url"
          autocomplete="url"
          spellcheck="false"
          required
          placeholder="google.com"
        >
        <button type="submit">Short it</button>
      </form>

      <p class="status" :class="{ 'is-error': failed }" role="status" aria-live="polite">{{ output }}</p>
    </section>

    <footer class="footer">
      <span>No account. No dashboard.</span>
      <span class="footer-mark" aria-hidden="true">↳</span>
    </footer>
  </main>
</template>

<style>
:root {
  --paper: #f5efe4;
  --paper-raised: #fbf7ee;
  --ink: #211e19;
  --muted: #665f54;
  --rule: #d9d1c3;
  --field-line: #8d8271;
  --accent: #b8431c;
  --accent-strong: #953413;
  --error: #96301a;
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --mono: ui-monospace, "SFMono-Regular", "Cascadia Mono", Menlo, monospace;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--paper);
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

#__nuxt {
  min-height: 100vh;
}

::selection {
  background: var(--accent);
  color: var(--paper-raised);
}
</style>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  width: min(100%, 52rem);
  min-height: 100vh;
  min-height: 100svh;
  margin-inline: auto;
  padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1.25rem, 5vw, 3rem);
}

.masthead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--rule);
}

.wordmark {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
}

.kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.kicker-arrow {
  color: var(--accent);
  font-size: 0.9rem;
  letter-spacing: 0;
  line-height: 1;
}

.hero {
  margin-block: auto;
  padding-block: clamp(3rem, 9vh, 6rem);
}

.headline {
  margin: 0;
  font-family: var(--serif);
  font-size: clamp(2.75rem, 8vw, 5rem);
  font-weight: 600;
  line-height: 0.94;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.headline span {
  display: block;
}

.lede {
  max-width: 38ch;
  margin-top: 1.35rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.6vw, 1.125rem);
  line-height: 1.6;
}

.shortener {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  max-width: 34rem;
  margin-top: clamp(2rem, 5vh, 2.75rem);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.shortener input {
  width: 100%;
  min-height: 3.25rem;
  padding: 0 1rem;
  border: 1px solid var(--field-line);
  border-radius: 0.375rem;
  background: var(--paper-raised);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 1rem;
  font-weight: 500;
}

.shortener input::placeholder {
  color: var(--muted);
  opacity: 1;
}

.shortener input:focus-visible {
  border-color: var(--accent);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.shortener button {
  min-height: 3.25rem;
  padding: 0 1.5rem;
  border: 1px solid var(--ink);
  border-radius: 0.375rem;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--sans);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease, transform 120ms ease;
}

.shortener button:hover {
  border-color: var(--accent-strong);
  background: var(--accent-strong);
}

.shortener button:active {
  transform: translateY(1px);
}

.shortener button:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.status {
  max-width: 34rem;
  min-height: 1.4rem;
  margin: 1.25rem 0 0;
  overflow-wrap: anywhere;
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.8125rem;
  line-height: 1.55;
}

.status:empty::before {
  content: "Your short link lands here.";
  opacity: 0.8;
}

.status:not(:empty):not(.is-error)::before {
  content: "↳ ";
  color: var(--accent);
}

.status.is-error {
  color: var(--error);
}

.status.is-error::before {
  content: "! ";
  font-weight: 700;
}

.footer {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 0.6875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.footer-mark {
  color: var(--accent);
  font-size: 0.9rem;
  letter-spacing: 0;
}

@media (max-width: 34rem) {
  .masthead {
    align-items: center;
  }

  .hero {
    padding-block: clamp(2.5rem, 10vh, 4rem);
  }

  .shortener {
    grid-template-columns: 1fr;
  }

  .shortener button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shortener button {
    transition: none;
  }
}
</style>
