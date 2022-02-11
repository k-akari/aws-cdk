import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('Vpc', () => {
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

  template.resourceCountIs('AWS::EC2::Subnet', 4);
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.10.0/24',
    AvailabilityZone: 'ap-northeast-1a',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-public-1a` }]
  });
});
