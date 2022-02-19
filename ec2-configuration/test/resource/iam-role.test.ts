import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Iam from '../../lib/stack/iam-stack';

test('IamRole', () => {
  const serviceName = 'service';
  const envType = 'test';
  const repositoryName = 'planning-poker';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType,
      'repositoryName': repositoryName
    }
  });
  const stack = new Iam.IamStack(app, 'IamStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::IAM::Role', 3);
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
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Condition: {
            StringLike: {
              'token.actions.githubusercontent.com:sub': Match.anyValue()
            }
          },
          Effect: 'Allow',
          Action: 'sts:AssumeRoleWithWebIdentity',
          Principal: {
            Federated: { Ref: Match.anyValue() }
          }
        },
        {
          Action: 'sts:GetCallerIdentity',
          Effect: 'Allow',
          Resource: '*'
        }
      ],
      Version: Match.anyValue()
    },
    RoleName: `${serviceName}-${envType}-role-github`
  });

  template.hasResourceProperties('Custom::AWSCDKOpenIdConnectProvider', {
    ServiceToken: Match.anyValue(),
    Url: 'https://vstoken.actions.githubusercontent.com',
    ClientIDList: Match.arrayWith(['sigstore']),
    ThumbprintList: Match.arrayWith(['a031c46782e6e6c662c2c87c76da9aa62ccabd8e']),
  });

  template.resourceCountIs('AWS::IAM::InstanceProfile', 1);
  template.hasResourceProperties('AWS::IAM::InstanceProfile', {
    Roles: Match.arrayWith([{ 'Ref': 'RoleEc2' }]),
    InstanceProfileName: `${serviceName}-${envType}-role-ec2`
  });
});
