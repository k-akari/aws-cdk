import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as GithubActions from '../../lib/stack/github-actions-stack';

test('GithubActionsSnapshot', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new GithubActions.GithubActionsStack(app, 'GitHubActionsStack');
  const template = Template.fromStack(stack);

  // IAM Role
  template.resourceCountIs('AWS::IAM::Role', 2);
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

  // Snapshot
  expect(template).toMatchSnapshot();
});
