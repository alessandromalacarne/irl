import {
    DynamoDBClient,
    DescribeTableCommand,
    CreateTableCommand,
} from '@aws-sdk/client-dynamodb'

export const TABLE_NAME = 'shortened'

async function waitForTableActive(client: DynamoDBClient): Promise<void> {
    while (true) {
        const result = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }))
        if (result.Table?.TableStatus === 'ACTIVE') {
            break
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }
}

export async function ensureShortenedTable(): Promise<void> {
    const client = new DynamoDBClient({})

    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }))
        return
    } catch (error) {
        if (!(error instanceof Error) || error.name !== 'ResourceNotFoundException') {
            throw error
        }
    }

    await client.send(
        new CreateTableCommand({
            TableName: TABLE_NAME,
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST',
        })
    )

    await waitForTableActive(client)
}
