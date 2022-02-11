import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('Vpc', () => {
  const app = new App({
    context: {
      'serviceName': 'service',
      'envType': 'test'
    }
  });
  const stack = new Network.NetworkStack(app, 'NetworkStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
    Tags: [{ 'Key': 'Name', 'Value': 'service-test-vpc' }]
  });
});
