import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';

test('NetworkStack', () => {
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

  // VPC
  template.resourceCountIs('AWS::EC2::VPC', 1);
  template.hasResourceProperties('AWS::EC2::VPC', {
    CidrBlock: '10.0.0.0/16',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-vpc` }]
  });

  // Subnet
  template.resourceCountIs('AWS::EC2::Subnet', 2);
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.10.0/24',
    VpcId: Match.objectLike({ Ref: Match.anyValue() }),
    AvailabilityZone: 'ap-northeast-1a',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-public-1a` }]
  });
  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.11.0/24',
    VpcId: Match.objectLike({ Ref: Match.anyValue() }),
    AvailabilityZone: 'ap-northeast-1c',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-public-1c` }]
  });

  // Route Table
  template.resourceCountIs('AWS::EC2::RouteTable', 1);
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({ Ref: Match.anyValue() }),
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-rtb-public` }]
  });

  template.resourceCountIs('AWS::EC2::Route', 1);
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({ Ref: 'RouteTablePublic' }),
    DestinationCidrBlock: '0.0.0.0/0',
    GatewayId: Match.objectLike({ Ref: 'InternetGateway' }),
  });

  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 2);

  // Network ACL
  template.resourceCountIs('AWS::EC2::NetworkAcl', 1);
  template.hasResourceProperties('AWS::EC2::NetworkAcl', {
    VpcId: Match.objectLike({
      Ref: Match.anyValue()
    }),
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-nacl-public` }]
  });

  template.resourceCountIs('AWS::EC2::NetworkAclEntry', 2);
  template.hasResourceProperties('AWS::EC2::NetworkAclEntry', {
    NetworkAclId: Match.objectLike({
      Ref: 'NetworkAclPublic'
    }),
    Protocol: -1,
    RuleAction: 'allow',
    RuleNumber: 100,
    CidrBlock: '0.0.0.0/0'
  });

  template.resourceCountIs('AWS::EC2::SubnetNetworkAclAssociation', 2);
  template.hasResourceProperties('AWS::EC2::SubnetNetworkAclAssociation', {
    NetworkAclId: Match.objectLike({
      Ref: 'NetworkAclPublic'
    }),
    SubnetId: Match.objectLike({
      Ref: 'SubnetPublic1a'
    }),
  });
  template.hasResourceProperties('AWS::EC2::SubnetNetworkAclAssociation', {
    NetworkAclId: Match.objectLike({
      Ref: 'NetworkAclPublic'
    }),
    SubnetId: Match.objectLike({
      Ref: 'SubnetPublic1c'
    }),
  });

  // Snapshot
  expect(template).toMatchSnapshot();
});
