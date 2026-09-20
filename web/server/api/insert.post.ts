import type { SendUrlResponse } from '../../types'
import { shortener } from '../service/shortener'

function isValidUrl(url: unknown): url is string {
  if (typeof url !== 'string' || url.length === 0) {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default defineEventHandler(async (event): Promise<SendUrlResponse> => {
  const body = await readBody(event)

  if (!isValidUrl(body?.url)) {
    throw createError({ statusCode: 400, statusMessage: 'A valid url is required' })
  }

  try {
    return await shortener.shorten(body.url)
  } catch (error) {
    console.error('Failed to shorten url', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not shorten the url' })
  }
})
