import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('NatGateway', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new Network.NetworkStack(app, 'NetworkStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::NatGateway', 2);
  template.hasResourceProperties('AWS::EC2::NatGateway', {
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-ngw-1a` }]
  });
  template.hasResourceProperties('AWS::EC2::NatGateway', {
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-ngw-1c` }]
  });
});
