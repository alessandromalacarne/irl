import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb"

const tableName = process.env.SHORTENED_TABLE_NAME ?? "shortened"
const endpoint = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000"

async function waitForTableActive(client: DynamoDBClient): Promise<void> {
  while (true) {
    const result = await client.send(new DescribeTableCommand({ TableName: tableName }))

    if (result.Table?.TableStatus === "ACTIVE") {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}

export default async function globalSetup(): Promise<void> {
  const client = new DynamoDBClient({
    endpoint,
    region: process.env.AWS_REGION ?? "us-east-1",
    credentials: { accessKeyId: "local", secretAccessKey: "local" },
  })

  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }))
    return
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error
    }
  }

  await client.send(new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  }))

  await waitForTableActive(client)
}
