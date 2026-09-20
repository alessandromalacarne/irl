#!/usr/bin/env node
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ensureShortenedTable } from '../lib/shortened'

const endpoint = process.env.DYNAMODB_ENDPOINT

const client = new DynamoDBClient({
  ...(endpoint && { endpoint }),
})

ensureShortenedTable(client)
  .then(() => {
    console.log('Shortened table ready')
  })
  .catch((error) => {
    console.error('Could not ensure the shortened table', error)
    process.exit(1)
  })
