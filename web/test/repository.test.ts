import { describe, it, expect } from "vitest"
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb"
import type { AttributeValue } from "@aws-sdk/client-dynamodb"
import {
  createShortenedRepository,
  IdAlreadyExistsError,
} from "../server/repository/shortened"

type Item = Record<string, AttributeValue>

class FakeDynamoDB {
  items = new Map<string, Item>()
  puts: PutItemCommand[] = []
  gets: GetItemCommand[] = []
  failWith: Error | null = null

  send = async (command: unknown): Promise<unknown> => {
    if (command instanceof PutItemCommand) {
      if (this.failWith) {
        throw this.failWith
      }

      const item = command.input.Item
      const id = item?.id?.S
      if (!item || !id) {
        throw new Error("PutItemCommand is missing an id")
      }

      this.puts.push(command)

      if (this.items.has(id)) {
        throw new ConditionalCheckFailedException({
          message: `The conditional request failed for ${id}`,
          $metadata: {},
        })
      }

      this.items.set(id, item)
      return {}
    }

    if (command instanceof GetItemCommand) {
      this.gets.push(command)
      const id = command.input.Key?.id?.S
      if (!id) {
        throw new Error("GetItemCommand is missing an id")
      }

      return { Item: this.items.get(id) }
    }

    throw new Error("Unexpected command")
  }

  asClient(): DynamoDBClient {
    return this as unknown as DynamoDBClient
  }
}

const stored = {
  id: "abc123",
  url: "https://example.com",
  createdAt: "2026-09-19T00:00:00.000Z",
}

function repositoryUsing(db: FakeDynamoDB) {
  return createShortenedRepository({
    client: db.asClient(),
    tableName: "shortened",
  })
}

describe("[Repository.Shortened] create", () => {
  it("[Repository.Shortened] create stores id, url and createdAt under a constant condition", async () => {
    const db = new FakeDynamoDB()

    await repositoryUsing(db).create(stored)

    expect(db.puts).toHaveLength(1)
    expect(db.puts[0].input.TableName).toBe("shortened")
    expect(db.puts[0].input.ConditionExpression).toBe(
      "attribute_not_exists(id)",
    )
    expect(db.items.get("abc123")).toEqual({
      id: { S: "abc123" },
      url: { S: "https://example.com" },
      createdAt: { S: "2026-09-19T00:00:00.000Z" },
    })
  })

  it("[Repository.Shortened] create translates a failed condition into IdAlreadyExistsError", async () => {
    const db = new FakeDynamoDB()
    db.items.set("abc123", { id: { S: "abc123" } })

    const error = await repositoryUsing(db)
      .create(stored)
      .catch((failure) => failure)

    expect(error).toBeInstanceOf(IdAlreadyExistsError)
    expect(error.message).toBe("Short id already exists: abc123")
  })

  it("[Repository.Shortened] create rethrows failures that are not collisions", async () => {
    const db = new FakeDynamoDB()
    const failure = new Error("boom")
    db.failWith = failure

    await expect(repositoryUsing(db).create(stored)).rejects.toBe(failure)
  })
})

describe("[Repository.Shortened] find", () => {
  it("[Repository.Shortened] find returns the stored shortened url", async () => {
    const db = new FakeDynamoDB()
    db.items.set("abc123", {
      id: { S: "abc123" },
      url: { S: "https://example.com" },
      createdAt: { S: "2026-09-19T00:00:00.000Z" },
    })

    await expect(repositoryUsing(db).find("abc123")).resolves.toEqual(stored)
    expect(db.gets[0].input.TableName).toBe("shortened")
    expect(db.gets[0].input.Key).toEqual({ id: { S: "abc123" } })
  })

  it("[Repository.Shortened] find returns null when the id is unknown", async () => {
    const db = new FakeDynamoDB()

    await expect(repositoryUsing(db).find("unknown")).resolves.toBeNull()
  })
})

describe("[Repository.Shortened] malformed items", () => {
  function expectMalformed(item: Record<string, AttributeValue>) {
    const db = new FakeDynamoDB()
    db.items.set("abc123", item)

    return expect(repositoryUsing(db).find("abc123")).rejects.toThrow(
      "Stored shortened url is malformed",
    )
  }

  it("[Repository.Shortened] find throws when createdAt is missing", async () => {
    await expectMalformed({
      id: { S: "abc123" },
      url: { S: "https://example.com" },
    })
  })

  it("[Repository.Shortened] find throws when the id is missing", async () => {
    await expectMalformed({
      url: { S: "https://example.com" },
      createdAt: { S: "2026-09-19T00:00:00.000Z" },
    })
  })

  it("[Repository.Shortened] find throws when the url is missing", async () => {
    await expectMalformed({
      id: { S: "abc123" },
      createdAt: { S: "2026-09-19T00:00:00.000Z" },
    })
  })
})
