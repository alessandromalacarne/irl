#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IrlStack } from '../lib/irl-stack';

const app = new cdk.App();
new IrlStack(app, 'IrlStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
