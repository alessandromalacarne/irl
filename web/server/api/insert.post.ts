import type { SendUrlResponse } from '../../types'
import { shortener } from '../service/shortener'

const SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i
const BARE_HOST = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#]|$)/i

function normalizeUrl(url: unknown): string | null {
  if (typeof url !== 'string') {
    return null
  }

  const trimmed = url.trim()

  if (trimmed.length === 0) {
    return null
  }

  const hasScheme = SCHEME.test(trimmed)

  if (!hasScheme && !BARE_HOST.test(trimmed)) {
    return null
  }

  const candidate = hasScheme ? trimmed : `https://${trimmed}`

  try {
    const { protocol } = new URL(candidate)

    return protocol === 'http:' || protocol === 'https:' ? candidate : null
  } catch {
    return null
  }
}

export default defineEventHandler(async (event): Promise<SendUrlResponse> => {
  const body = await readBody(event)
  const url = normalizeUrl(body?.url)

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'A valid url is required' })
  }

  try {
    return await shortener.shorten(url)
  } catch (error) {
    console.error('Failed to shorten url', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not shorten the url' })
  }
})
