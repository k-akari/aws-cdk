import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('Subnet', () => {
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
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    AvailabilityZone: 'ap-northeast-1a',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-public-1a` }]
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.11.0/24',
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    AvailabilityZone: 'ap-northeast-1c',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-public-1c` }]
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.100.0/24',
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    AvailabilityZone: 'ap-northeast-1a',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-private-1a` }]
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.101.0/24',
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    AvailabilityZone: 'ap-northeast-1c',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-private-1c` }]
  });
});
