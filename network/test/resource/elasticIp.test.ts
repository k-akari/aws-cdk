import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('ElasticIp', () => {
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

  template.resourceCountIs('AWS::EC2::EIP', 2);
  template.hasResourceProperties('AWS::EC2::EIP', {
    Domain: 'vpc',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-eip-ngw-1a` }]
  });
  template.hasResourceProperties('AWS::EC2::EIP', {
    Domain: 'vpc',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-eip-ngw-1c` }]
    });
});
