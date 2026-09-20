export interface SendUrlResponse {
  id: string,
  url: string
}

export interface ShortenedUrl {
  id: string,
  url: string,
  createdAt: string
}

export interface ResolveUrlResponse {
  id: string,
  url: string
}
