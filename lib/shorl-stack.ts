import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ShorlStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const main = new lambda.Function(this, 'Main', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`exports.handler = async (event) => { 
        return { statusCode: 200, body: 'Hello from Shorl!' };
}`),
    });

    const mainUrl = main.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // WARNING: Insecure
    });
    new cdk.CfnOutput(this, 'MainUrl', {
      value: mainUrl.url,
    });
  }
}
