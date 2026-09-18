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

vi.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: vi.fn().mockImplementation(function() {
        return new MockDynamoDBClient()
    }),
    DescribeTableCommand: vi.fn().mockImplementation(function(input: unknown) {
        return new MockDescribleTableCommand(input)
    }),
    CreateTableCommand: vi.fn().mockImplementation(function(input: unknown) {
        return new MockCreateTableCommand(input)
    }),
}))

import { ensureShortenedTable } from '../lib/shortened'

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
        const error = new Error('ResourceNotFoundException')
        error.name = 'ResourceNotFoundException'
        mockSend
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ TableDescription: { TableName: 'shortened' } })
            .mockResolvedValueOnce({ Table: { TableStatus: 'ACTIVE' } })

        await ensureShortenedTable()

        expect(mockSend).toHaveBeenCalledTimes(3)
    })

    it('should wait for table to become active after creation', async () => {
        const error = new Error('ResourceNotFoundException')
        error.name = 'ResourceNotFoundException'
        mockSend
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ Table: { TableStatus: 'CREATING' } })
            .mockResolvedValueOnce({ Table: { TableStatus: 'ACTIVE' } })

        await ensureShortenedTable()

        expect(mockSend).toHaveBeenCalledTimes(3)
    })
})
