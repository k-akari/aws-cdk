import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as Network from '../../lib/stack/network-stack';

test('SecurityGroup', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  
  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const securityGroupstack = new SecurityGroup.SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
  const template = Template.fromStack(securityGroupstack);

  template.resourceCountIs('AWS::EC2::SecurityGroup', 2);
  template.hasResourceProperties('AWS::EC2::SecurityGroup', {
    GroupDescription: 'for ALB',
    GroupName: `${serviceName}-${envType}-sg-alb`,
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-sg-alb` }],
    VpcId: Match.objectLike({
      'Fn::ImportValue': Match.anyValue()
    })
  });
  template.hasResourceProperties('AWS::EC2::SecurityGroup', {
    GroupDescription: 'for EC2',
    GroupName: `${serviceName}-${envType}-sg-ec2`,
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-sg-ec2` }],
    VpcId: Match.objectLike({
      'Fn::ImportValue': Match.anyValue()
    })
  });

  template.resourceCountIs('AWS::EC2::SecurityGroupIngress', 3);
  template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    CidrIp: '0.0.0.0/0',
    FromPort: 80,
    ToPort: 80,
    GroupId: Match.objectLike({
      'Fn::GetAtt': Match.arrayWith(['SecurityGroupAlb', 'GroupId'])
    })
  });
  template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    CidrIp: '0.0.0.0/0',
    FromPort: 443,
    ToPort: 443,
    GroupId: Match.objectLike({
      'Fn::GetAtt': Match.arrayWith(['SecurityGroupAlb', 'GroupId'])
    })
  });
  template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
    IpProtocol: 'tcp',
    CidrIp: Match.absent(),
    FromPort: 80,
    ToPort: 80,
    GroupId: Match.objectLike({
      'Fn::GetAtt': Match.arrayWith(['SecurityGroupEc2', 'GroupId'])
    }),
    SourceSecurityGroupId: Match.anyValue()
  });

  template.resourceCountIs('AWS::EC2::SecurityGroupEgress', 1);
  template.hasResourceProperties('AWS::EC2::SecurityGroupEgress', {
    IpProtocol: 'tcp',
    CidrIp: '0.0.0.0/0',
    FromPort: 443,
    ToPort: 443,
    GroupId: Match.objectLike({
      'Fn::GetAtt': Match.arrayWith(['SecurityGroupEc2', 'GroupId'])
    })
  });
});
