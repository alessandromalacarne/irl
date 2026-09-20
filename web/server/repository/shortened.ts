import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb'
import type { AttributeValue } from '@aws-sdk/client-dynamodb'
import type { ShortenedUrl } from '../../types'
import { AWS_REGION, DYNAMODB_ENDPOINT, TABLE_NAME } from '../config'

export class IdAlreadyExistsError extends Error {}

export interface ShortenedRepository {
  create(item: ShortenedUrl): Promise<void>
  find(id: string): Promise<ShortenedUrl | null>
}

export function createDynamoDBClient(): DynamoDBClient {
  return new DynamoDBClient({
    region: AWS_REGION,
    ...(DYNAMODB_ENDPOINT && { endpoint: DYNAMODB_ENDPOINT }),
  })
}

function toShortenedUrl(item: Record<string, AttributeValue>): ShortenedUrl {
  const id = item.id?.S
  const url = item.url?.S
  const createdAt = item.createdAt?.S

  if (!id || !url || !createdAt) {
    throw new Error('Stored shortened url is malformed')
  }

  return { id, url, createdAt }
}

export function createShortenedRepository({
  client = createDynamoDBClient(),
  tableName = TABLE_NAME,
}: {
  client?: DynamoDBClient
  tableName?: string
} = {}): ShortenedRepository {
  return {
    async create(item: ShortenedUrl): Promise<void> {
      try {
        await client.send(new PutItemCommand({
          TableName: tableName,
          Item: {
            id: { S: item.id },
            url: { S: item.url },
            createdAt: { S: item.createdAt },
          },
          ConditionExpression: 'attribute_not_exists(id)',
        }))
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          throw new IdAlreadyExistsError(`Short id already exists: ${item.id}`)
        }
        throw error
      }
    },

    async find(id: string): Promise<ShortenedUrl | null> {
      const result = await client.send(new GetItemCommand({
        TableName: tableName,
        Key: { id: { S: id } },
      }))

      if (!result.Item) {
        return null
      }

      return toShortenedUrl(result.Item)
    },
  }
}
