import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class IrlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const main = new lambda.Function(this, 'Main', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../web/.output/server'),
    });

    const mainUrl = main.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // WARNING: Insecure
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
