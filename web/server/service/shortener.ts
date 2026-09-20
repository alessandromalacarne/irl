import { nanoid } from 'nanoid'
import type { SendUrlResponse, ShortenedUrl } from '../../types'
import { createShortenedRepository, IdAlreadyExistsError } from '../repository/shortened'
import type { ShortenedRepository } from '../repository/shortened'

const MAX_ATTEMPTS = 3
const ID_LENGTH = 6

export class UrlNotFoundError extends Error {}

export interface Shortener {
  shorten(url: string): Promise<SendUrlResponse>
  resolve(id: string): Promise<ShortenedUrl>
}

export function createShortener(
  repository: ShortenedRepository,
  generateId: () => string = () => nanoid(ID_LENGTH),
): Shortener {
  return {
    async shorten(url: string): Promise<SendUrlResponse> {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const id = generateId()

        try {
          await repository.create({ id, url, createdAt: new Date().toISOString() })
          return { id, url }
        } catch (error) {
          if (!(error instanceof IdAlreadyExistsError)) {
            throw error
          }
        }
      }

      throw new Error(`Could not generate a unique id after ${MAX_ATTEMPTS} attempts`)
    },

    async resolve(id: string): Promise<ShortenedUrl> {
      const shortened = await repository.find(id)

      if (!shortened) {
        throw new UrlNotFoundError(`Short url not found: ${id}`)
      }

      return shortened
    },
  }
}

export const shortener = createShortener(createShortenedRepository())
