import { vi, beforeEach, describe, it, expect } from 'vitest'

const mockSend = vi.fn();

class MockDynamoDBClient {
    send = mockSend;
}

class MockDescribleTableCommand {
    input: unknown;
    type = 'DescribleTableCommand';

    constructor(input: unknown) {
        this.input = input;
    }
}

class MockCreateTableCommand {
    input: unknown;
    type = 'CreateTableCommand';

    constructor(input: unknown) {
        this.input = input;
    }
}

vi.mock('@aws-sdk/client-dynamodb', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@aws-sdk/client-dynamodb')>()
    return {
        DynamoDBClient: vi.fn().mockImplementation(function() {
            return new MockDynamoDBClient()
        }),
        DescribeTableCommand: vi.fn().mockImplementation(function(input: unknown) {
            return new MockDescribleTableCommand(input)
        }),
        CreateTableCommand: vi.fn().mockImplementation(function(input: unknown) {
            return new MockCreateTableCommand(input)
        }),
        ResourceNotFoundException: actual.ResourceNotFoundException,
    }
})

import { ensureShortenedTable } from '../lib/shortened'
import { ResourceNotFoundException } from '@aws-sdk/client-dynamodb'

function resourceNotFound(): ResourceNotFoundException {
    return new ResourceNotFoundException({
        message: 'Requested resource not found: Table: shortened not found',
        $metadata: {},
    })
}

describe('ensureShortenedTable', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should not create table if it already exists', async () => {
        mockSend.mockResolvedValueOnce({
            Table: {
                TableName: 'shortened',
                TableStatus: 'ACTIVE',
            },
        })

        await ensureShortenedTable()

        expect(mockSend).toHaveBeenCalledTimes(1)
    })

    it('should create table if it does not exist', async () => {
        mockSend
            .mockRejectedValueOnce(resourceNotFound())
            .mockResolvedValueOnce({ TableDescription: { TableName: 'shortened' } })
            .mockResolvedValueOnce({ Table: { TableStatus: 'ACTIVE' } })

        await ensureShortenedTable()

        expect(mockSend).toHaveBeenCalledTimes(3)
    })

    it('should wait for table to become active after creation', async () => {
        mockSend
            .mockRejectedValueOnce(resourceNotFound())
            .mockResolvedValueOnce({ Table: { TableStatus: 'CREATING' } })
            .mockResolvedValueOnce({ Table: { TableStatus: 'ACTIVE' } })

        await ensureShortenedTable()

        expect(mockSend).toHaveBeenCalledTimes(3)
    })
})
