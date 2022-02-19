import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as Server from '../../lib/stack/server-stack';

test('ServerStack', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });

  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const serverStack = new Server.ServerStack(app, 'ServerStack', networkStack.vpc, networkStack.subnet);
  const template = Template.fromStack(serverStack);

  // Iam Role
  template.resourceCountIs('AWS::IAM::Role', 1);
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [{
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: { "Fn::Join": ["", ["ec2.", { "Ref": "AWS::URLSuffix" }]] }
        }
      }],
      Version: Match.anyValue()
    },
    ManagedPolicyArns: Match.anyValue(),
    RoleName: `${serviceName}-${envType}-role-ec2`
  });

  template.resourceCountIs('AWS::IAM::InstanceProfile', 1);
  template.hasResourceProperties('AWS::IAM::InstanceProfile', {
    Roles: Match.arrayWith([{ 'Ref': 'RoleEc2' }]),
    InstanceProfileName: `${serviceName}-${envType}-role-ec2`
  });

  template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    IpAddressType: 'ipv4',
    Name: `${serviceName}-${envType}-alb`,
    Scheme: 'internet-facing',
    SecurityGroups: Match.anyValue(),
    Subnets: Match.anyValue(),
    Type: 'application'
  });

  // Security Group
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

  // EC2
  template.resourceCountIs('AWS::EC2::Instance', 1);
  template.hasResourceProperties('AWS::EC2::Instance', {
    AvailabilityZone: 'ap-northeast-1a',
    IamInstanceProfile: { Ref: Match.anyValue() },
    ImageId: 'ami-08a8688fb7eacb171',
    InstanceType: 't3.small',
    SecurityGroupIds: [{ 'Fn::GetAtt': Match.anyValue() }],
    SubnetId: { 'Fn::ImportValue': Match.anyValue() },
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-ec2-1a` }]
  });

  // Elastic IP
  template.resourceCountIs('AWS::EC2::EIP', 1);
  template.hasResourceProperties('AWS::EC2::EIP', {
    Domain: 'vpc',
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-eip-ec2-1a` }]
  });

  template.resourceCountIs('AWS::EC2::EIPAssociation', 1);
  template.hasResourceProperties('AWS::EC2::EIPAssociation', {
    EIP: { Ref: Match.anyValue() },
    InstanceId: { Ref: Match.anyValue() }
  });

  // ELB
  template.resourceCountIs('AWS::ElasticLoadBalancingV2::TargetGroup', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
    Name: `${serviceName}-${envType}-tg`,
    Port: 80,
    Protocol: 'HTTP',
    Targets: Match.anyValue(),
    TargetType: 'instance',
    VpcId: { 'Fn::ImportValue': Match.anyValue() },
  });

  template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
    DefaultActions: [{
      Type: 'forward',
      ForwardConfig: {
        TargetGroups: [{
          TargetGroupArn: Match.anyValue(),
          Weight: 1
        }]
      }
    }],
    LoadBalancerArn: Match.anyValue(),
    Port: 80,
    Protocol: 'HTTP'
  });

  // Snapshot
  expect(template).toMatchSnapshot();
});
