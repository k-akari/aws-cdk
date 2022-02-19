import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';

test('NetworkAcl', () => {
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
});