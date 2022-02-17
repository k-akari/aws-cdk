import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';

test('RouteTable', () => {
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

  template.resourceCountIs('AWS::EC2::RouteTable', 2);
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({ Ref: Match.anyValue() }),
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-rtb-public` }]
  });
  template.hasResourceProperties('AWS::EC2::RouteTable', {
    VpcId: Match.objectLike({ Ref: Match.anyValue() }),
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-rtb-private-1a` }]
  });

  template.resourceCountIs('AWS::EC2::Route', 2);
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({ Ref: 'RouteTablePublic' }),
    DestinationCidrBlock: '0.0.0.0/0',
    GatewayId: Match.objectLike({ Ref: 'InternetGateway' }),
  });
  template.hasResourceProperties('AWS::EC2::Route', {
    RouteTableId: Match.objectLike({ Ref: 'RouteTablePrivate1a' }),
    DestinationCidrBlock: '0.0.0.0/0',
    NatGatewayId: Match.objectLike({ Ref: 'NatGateway1a' }),
  });

  template.resourceCountIs('AWS::EC2::SubnetRouteTableAssociation', 2);
});
