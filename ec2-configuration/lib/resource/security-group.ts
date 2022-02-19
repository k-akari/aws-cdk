import { Construct } from 'constructs';
import { Vpc, CfnSecurityGroup, CfnSecurityGroupIngress, CfnSecurityGroupEgress } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class SecurityGroup extends Resource {
  public alb: CfnSecurityGroup;
  public ec2: CfnSecurityGroup;

  private readonly vpc: Vpc;

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    this.alb = this.createAlbSecurityGroup(scope);
    this.ec2 = this.createEc2SecurityGroup(scope);
  };

  private createAlbSecurityGroup(scope: Construct): CfnSecurityGroup {
    // Create Security Group
    const securityGroupName = this.createResourceName(scope, 'sg-alb');
    const securityGroup = new CfnSecurityGroup(scope, 'SecurityGroupAlb', {
      groupDescription: 'for ALB',
      groupName: securityGroupName,
      vpcId: this.vpc.vpcId,
      tags: [{ key: 'Name', value: securityGroupName }]
    });

    // Create Ingress Rules and Associate them with the Security Group
    new CfnSecurityGroupIngress(scope, 'SecurityGroupIngressAlb1', {
      ipProtocol: 'tcp',
      cidrIp: '0.0.0.0/0',
      fromPort: 80,
      toPort: 80,
      groupId: securityGroup.attrGroupId
    });
    new CfnSecurityGroupIngress(scope, 'SecurityGroupIngressAlb2', {
      ipProtocol: 'tcp',
      cidrIp: '0.0.0.0/0',
      fromPort: 443,
      toPort: 443,
      groupId: securityGroup.attrGroupId
    });

    return securityGroup;
  }

  private createEc2SecurityGroup(scope: Construct): CfnSecurityGroup {
    // Create Security Group
    const securityGroupName = this.createResourceName(scope, 'sg-ec2');
    const securityGroup = new CfnSecurityGroup(scope, 'SecurityGroupEc2', {
      groupDescription: 'for EC2',
      groupName: securityGroupName,
      vpcId: this.vpc.vpcId,
      tags: [{ key: 'Name', value: securityGroupName }]
    });

    // Create a Ingress Rule and Associate it with the Security Group
    new CfnSecurityGroupIngress(scope, 'SecurityGroupIngressEc21', {
      ipProtocol: 'tcp',
      fromPort: 80,
      toPort: 80,
      groupId: securityGroup.attrGroupId,
      sourceSecurityGroupId: this.alb.attrGroupId
    });

    // Create a Egress Rule and Associate it with the Security Group
    new CfnSecurityGroupEgress(scope, 'SecurityGroupEgressEc21', {
      ipProtocol: 'tcp',
      cidrIp: '0.0.0.0/0',
      fromPort: 443,
      toPort: 443,
      groupId: securityGroup.attrGroupId
    });

    return securityGroup;
  }
}
