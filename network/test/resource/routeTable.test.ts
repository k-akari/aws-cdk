import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/network-stack';

test('RouteTable', () => {
  const app = new App({
    context: {
      'serviceName': 'service',
      'envType': 'test'
    }
  });
  const stack = new Network.NetworkStack(app, 'NetworkStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::RouteTable', 3);
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    Tags: [{ 'Key': 'Name', 'Value': 'service-test-rtb-public' }]
  });
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    Tags: [{ 'Key': 'Name', 'Value': 'service-test-rtb-private-1a' }]
  });
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({
      Ref: 'Vpc'
    }),
    Tags: [{ 'Key': 'Name', 'Value': 'service-test-rtb-private-1c' }]
  });

  template.resourceCountIs('AWS::EC2::Route', 3);
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({
      Ref: 'RouteTablePublic'
    }),
    DestinationCidrBlock: '0.0.0.0/0',
    GatewayId: Match.objectLike({
      Ref: 'InternetGateway'
    }),
  });
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({
      Ref: 'RouteTablePrivate1a'
    }),
    DestinationCidrBlock: '0.0.0.0/0',
    NatGatewayId: Match.objectLike({
      Ref: 'NatGateway1a'
    }),
  });
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({
      Ref: 'RouteTablePrivate1c'
    }),
    DestinationCidrBlock: '0.0.0.0/0',
    NatGatewayId: Match.objectLike({
      Ref: 'NatGateway1c'
    }),
  });

  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 4);
});
