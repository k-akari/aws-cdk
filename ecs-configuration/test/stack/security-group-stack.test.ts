import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as SecurityGroup from '../../lib/stack/security-group-stack';

test('SecurityGroupSnapshot', () => {
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
  const template = Template.fromStack(securityGroupStack);

  expect(template).toMatchSnapshot();
});
