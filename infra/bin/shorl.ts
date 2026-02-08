#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ShorlStack } from '../lib/shorl-stack';

const app = new cdk.App();
new ShorlStack(app, 'ShorlStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
