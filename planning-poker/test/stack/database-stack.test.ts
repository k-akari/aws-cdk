import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as SecretsManager from '../../lib/stack/secrets-manager-stack';
import * as Database from '../../lib/stack/database-stack';

test('DatabaseStackSnapshot', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const securityGroupStack = new SecurityGroup.SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
  const secretsManagerStack = new SecretsManager.SecretsManagerStack(app, 'SecretsManagerStack');
  const databaseStack = new Database.DatabaseStack(app, 'DatabaseStack', networkStack.subnet, securityGroupStack.sg, secretsManagerStack.ssm);
  const template = Template.fromStack(databaseStack);

  expect(template).toMatchSnapshot();
});
