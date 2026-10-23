import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    CreateTableCommand,
    InternalServerError,
    DescribeTableCommand,
    ResourceInUseException,
    ResourceNotFoundException,
    type DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { TABLE_NAME, MAX_WAIT_ATTEMPTS, ensureShortenedTable } from '../lib/shortened';

const PROVISION_MS = 3000;

type TableState = 'ABSENT' | 'CREATING' | 'ACTIVE';

class FakeDynamoDB {
    state: TableState = 'ABSENT';
    describes = 0;
    describeCommands: DescribeTableCommand[] = [];
    created: CreateTableCommand[] = [];
    describeFailure: Error | null = null;
    neverActivates = false;

    send = async (command: unknown): Promise<unknown> => {
        if (command instanceof DescribeTableCommand) {
            this.describes++;
            this.describeCommands.push(command);
            if (this.describeFailure) {
                throw this.describeFailure;
            }
            if (this.state === 'ABSENT') {
                throw new ResourceNotFoundException({
                    message: `Cannot do operations on a non-existent table: ${TABLE_NAME}`,
                    $metadata: {},
                });
            }
            return { Table: { TableName: TABLE_NAME, TableStatus: this.state } };
        }

        if (command instanceof CreateTableCommand) {
            if (this.state !== 'ABSENT') {
                throw new ResourceInUseException({
                    message: `Table already exists: ${TABLE_NAME}`,
                    $metadata: {},
                });
            }
            this.created.push(command);
            this.state = 'CREATING';
            if (!this.neverActivates) {
                setTimeout(() => {
                    this.state = 'ACTIVE';
                }, PROVISION_MS);
            }
            return { TableDescription: { TableName: TABLE_NAME, TableStatus: 'CREATING' } };
        }

        throw new Error(`Unexpected command`);
    };

    asClient(): DynamoDBClient {
        return this as unknown as DynamoDBClient;
    }
}

afterEach(() => {
    vi.useRealTimers();
});

describe('ensureShortenedTable: existing table', () => {
    it('leaves an existing active table untouched', async () => {
        const db = new FakeDynamoDB();
        db.state = 'ACTIVE';

        await ensureShortenedTable(db.asClient());

        expect(db.describes).toBeGreaterThan(0);
        expect(db.describeCommands[0].input.TableName).toBe('shortened');
        expect(db.created).toHaveLength(0);
        expect(db.state).toBe('ACTIVE');
    });
});

describe('ensureShortenedTable: provisioning', () => {
    it('creates the table with the schema the stack expects when it is missing', async () => {
        vi.useFakeTimers();
        const db = new FakeDynamoDB();

        const pending = ensureShortenedTable(db.asClient());
        await vi.advanceTimersByTimeAsync(PROVISION_MS * 4);
        await pending;

        expect(db.created).toHaveLength(1);
        expect(db.created[0].input).toMatchObject({
            TableName: 'shortened',
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST',
        });
        expect(db.state).toBe('ACTIVE');
    });

    it('does not resolve while the table is still provisioning', async () => {
        vi.useFakeTimers();
        const db = new FakeDynamoDB();

        const pending = ensureShortenedTable(db.asClient());
        let settled = false;
        void pending.then(() => {
            settled = true;
        });

        await vi.advanceTimersByTimeAsync(PROVISION_MS / 2);
        expect(db.state).toBe('CREATING');
        expect(settled).toBe(false);

        await vi.advanceTimersByTimeAsync(PROVISION_MS);
        await pending;
        expect(settled).toBe(true);
    });

    it('creates the table only once across repeated calls', async () => {
        vi.useFakeTimers();
        const db = new FakeDynamoDB();

        const first = ensureShortenedTable(db.asClient());
        await vi.advanceTimersByTimeAsync(PROVISION_MS * 4);
        await first;

        await ensureShortenedTable(db.asClient());

        expect(db.created).toHaveLength(1);
        expect(db.state).toBe('ACTIVE');
    });
});

describe('ensureShortenedTable: failures', () => {
    it('surfaces unexpected failures without creating anything', async () => {
        const db = new FakeDynamoDB();
        const failure = new InternalServerError({
            message: 'Internal server error',
            $metadata: { httpStatusCode: 500 },
        });
        db.describeFailure = failure;

        await expect(ensureShortenedTable(db.asClient())).rejects.toBe(failure);

        expect(db.created).toHaveLength(0);
        expect(db.state).toBe('ABSENT');
    });

    it('fails when the table never becomes active', async () => {
        vi.useFakeTimers();
        const db = new FakeDynamoDB();
        db.neverActivates = true;

        const pending = ensureShortenedTable(db.asClient());
        const expectation = expect(pending).rejects.toThrow('did not become active');

        await vi.advanceTimersByTimeAsync(MAX_WAIT_ATTEMPTS * 1000);
        await expectation;

        expect(db.created).toHaveLength(1);
        expect(db.state).toBe('CREATING');
    });
});
