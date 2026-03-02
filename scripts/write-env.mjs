#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputsPath = resolve(__dirname, '../infra/cdk-outputs.json')
const envPath = resolve(__dirname, '../web/.env')

let outputs
try {
  outputs = JSON.parse(readFileSync(outputsPath, 'utf8'))
} catch (err) {
  console.error('Error reading cdk-outputs.json:', err.message)
  process.exit(1)
}

const url = outputs?.IrlStack?.MainUrl
if (!url) {
  console.error('MainUrl not found in cdk-outputs.json')
  process.exit(1)
}

writeFileSync(envPath, `API_URL=${url}\n`)
console.log(`Wrote API_URL to web/.env: ${url}`)
