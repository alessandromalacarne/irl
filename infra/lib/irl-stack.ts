import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { TABLE_NAME } from './shortened';

export class IrlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const main = new lambda.Function(this, 'Main', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../web/.output/server'),
    });

    const shortenedTable = new dynamodb.Table(this, 'ShortenedTable', {
      tableName: TABLE_NAME,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    shortenedTable.grantReadWriteData(main);

    const mainUrl = main.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.POST],
        allowedHeaders: ['*'],
      },
    });
    new cdk.CfnOutput(this, 'MainUrl', {
      value: mainUrl.url,
    });
  }
}
