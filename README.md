# irl
A serverless URL shortner made with focus on low lattency.

## Features
- [ ] Easy self-hosting with docker
- [ ] Show lattency data on repository
- [ ] Handle loading states
- [ ] "Copy to Clipboard" button

## Local development

Start a local DynamoDB and point the app at it, so no AWS credentials are needed:

```bash
docker run --rm -p 8000:8000 amazon/dynamodb-local   # podman run works as well

export DYNAMODB_ENDPOINT=http://localhost:8000
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local

npm run db:local --prefix infra   # creates the shortened table
npm run dev
```

`DYNAMODB_ENDPOINT` is only read by the server; in AWS the Lambda uses the table name from the `SHORTENED_TABLE_NAME` environment variable set by the stack.

