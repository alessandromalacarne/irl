import { fileURLToPath } from 'url';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { describe, it, expect } from 'vitest';
import { IrlStack } from '../lib/irl-stack';
import { TABLE_NAME } from '../lib/shortened';

const serverAsset = fileURLToPath(new URL('./fixtures/server', import.meta.url));

function synthTemplate() {
    return Template.fromStack(
        new IrlStack(new App(), 'IrlStack', {
            env: { account: '123456789012', region: 'sa-east-1' },
            serverAssetPath: serverAsset,
        }),
    );
}

describe('[Infra.Stack] shortened table wiring', () => {
    it('[Infra.Stack] tells the lambda which table to use', () => {
        synthTemplate().hasResourceProperties('AWS::Lambda::Function', {
            Environment: {
                Variables: {
                    SHORTENED_TABLE_NAME: TABLE_NAME,
                },
            },
        });
    });

    it('[Infra.Stack] allows POST and GET on the function url', () => {
        synthTemplate().hasResourceProperties('AWS::Lambda::Url', {
            Cors: {
                AllowMethods: ['POST', 'GET'],
                AllowOrigins: ['*'],
                AllowHeaders: ['*'],
            },
        });
    });

    it('[Infra.Stack] grants item read and write on the table to the lambda role', () => {
        const policies = synthTemplate().findResources('AWS::IAM::Policy');
        const actions = Object.values(policies).flatMap((policy) =>
            policy.Properties.PolicyDocument.Statement.flatMap((statement: { Action: string[] }) => statement.Action),
        );

        expect(actions).toContain('dynamodb:GetItem');
        expect(actions).toContain('dynamodb:PutItem');
    });
});
