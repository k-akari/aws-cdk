import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Iam from '../../lib/stack/iam-stack';

test('IamRole', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new Iam.IamStack(app, 'IamStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::IAM::Role', 1);
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [{
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: { "Fn::Join": ["", ["ec2.", { "Ref": "AWS::URLSuffix" }]] }
        }
      }],
      Version: Match.anyValue()
    },
    ManagedPolicyArns: Match.anyValue(),
    RoleName: `${serviceName}-${envType}-role-ec2`
  });
});
