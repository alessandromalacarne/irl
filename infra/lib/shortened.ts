import {
    DynamoDBClient,
    DescribeTableCommand,
    CreateTableCommand,
    ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';

export const TABLE_NAME = 'shortened';
export const MAX_WAIT_ATTEMPTS = 30;

async function waitForTableActive(client: DynamoDBClient): Promise<void> {
    for (let attempt = 0; attempt < MAX_WAIT_ATTEMPTS; attempt++) {
        const result = await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        if (result.Table?.TableStatus === 'ACTIVE') {
            return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error(`Table ${TABLE_NAME} did not become active`);
}

export async function ensureShortenedTable(client: DynamoDBClient = new DynamoDBClient({})): Promise<void> {
    try {
        await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
        return;
    } catch (error) {
        if (!(error instanceof ResourceNotFoundException)) {
            throw error;
        }
    }

    await client.send(
        new CreateTableCommand({
            TableName: TABLE_NAME,
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST',
        }),
    );

    await waitForTableActive(client);
}
