import type { ResolveUrlResponse } from '../../../types'
import { shortener, UrlNotFoundError } from '../../service/shortener'

export default defineEventHandler(async (event): Promise<ResolveUrlResponse> => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'An id is required' })
  }

  try {
    const shortened = await shortener.resolve(id)
    return { id: shortened.id, url: shortened.url }
  } catch (error) {
    if (error instanceof UrlNotFoundError) {
      throw createError({ statusCode: 404, statusMessage: 'Short url not found' })
    }

    console.error('Failed to resolve short url', error)
    throw createError({ statusCode: 500, statusMessage: 'Could not resolve the url' })
  }
})
