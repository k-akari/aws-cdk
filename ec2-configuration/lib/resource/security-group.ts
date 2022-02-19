import { Construct } from 'constructs';
import { CfnSecurityGroup, CfnSecurityGroupIngress, CfnSecurityGroupIngressProps, CfnSecurityGroupEgress } from 'aws-cdk-lib/aws-ec2';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

interface IngressInfo {
  readonly id: string;
  readonly securityGroupIngressProps: CfnSecurityGroupIngressProps;
  readonly groupId: () => string;
  readonly sourceSecurityGroupId?: () => string;
}

interface EgressInfo {
  readonly id: string;
  readonly ipProtocol: string;
  readonly cidrIp: string;
  readonly fromPort: number;
  readonly toPort: number;
  readonly groupId: () => string;
  readonly sourceSecurityGroupId?: () => string;
}

interface SecurityGroupInfo {
  readonly id: string;
  readonly groupDescription: string;
  readonly ingresses: IngressInfo[];
  readonly egresses?: EgressInfo[];
  readonly resourceName: string;
  readonly assign: (securityGroup: CfnSecurityGroup) => void;
}

export class SecurityGroup extends Resource {
  public alb: CfnSecurityGroup;
  public ec2: CfnSecurityGroup;

  private readonly vpc: Vpc;
  private readonly securityGroupInfos: SecurityGroupInfo[] = [
    {
      id: 'SecurityGroupAlb',
      groupDescription: 'for ALB',
      ingresses: [
        {
          id: 'SecurityGroupIngressAlb1',
          securityGroupIngressProps: {
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
            fromPort: 80,
            toPort: 80
          },
          groupId: () => this.alb.attrGroupId
        },
        {
          id: 'SecurityGroupIngressAlb2',
          securityGroupIngressProps: {
            ipProtocol: 'tcp',
            cidrIp: '0.0.0.0/0',
            fromPort: 443,
            toPort: 443
          },
          groupId: () => this.alb.attrGroupId
        }
      ],
      resourceName: 'sg-alb',
      assign: securityGroup => this.alb = securityGroup
    },
    {
      id: 'SecurityGroupEc2',
      groupDescription: 'for EC2',
      ingresses: [
        {
          id: 'SecurityGroupIngressEc21',
          securityGroupIngressProps: {
            ipProtocol: 'tcp',
            fromPort: 80,
            toPort: 80
          },
          groupId: () => this.ec2.attrGroupId,
          sourceSecurityGroupId: () => this.alb.attrGroupId,
        }
      ],
      egresses: [
        {
          id: 'SecurityGroupEgressEc21',
          ipProtocol: 'tcp',
          cidrIp: '0.0.0.0/0',
          fromPort: 443,
          toPort: 443,
          groupId: () => this.ec2.attrGroupId
        }
      ],
      resourceName: 'sg-ec2',
      assign: securityGroup => this.ec2 = securityGroup
    }
  ];

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    for (const securityGroupInfo of this.securityGroupInfos) {
      const securityGroup = this.createSecurityGroup(scope, securityGroupInfo);
      securityGroupInfo.assign(securityGroup);

      this.createSecurityGroupIngress(scope, securityGroupInfo);
      this.createSecurityGroupEgress(scope, securityGroupInfo);
    }
  };

  private createSecurityGroup(scope: Construct, securityGroupInfo: SecurityGroupInfo): CfnSecurityGroup {
    const securityGroupName = this.createResourceName(scope, securityGroupInfo.resourceName);
    const securityGroup = new CfnSecurityGroup(scope, securityGroupInfo.id, {
      groupDescription: securityGroupInfo.groupDescription,
      groupName: securityGroupName,
      vpcId: this.vpc.vpcId,
      tags: [{
        key: 'Name',
        value: securityGroupName
      }]
    });

    return securityGroup;
  }

  private createSecurityGroupIngress(scope: Construct, securityGroupInfo: SecurityGroupInfo) {
    for (const ingress of securityGroupInfo.ingresses) {
      const securityGroupIngress = new CfnSecurityGroupIngress(scope, ingress.id, ingress.securityGroupIngressProps);
      securityGroupIngress.groupId = ingress.groupId();

      if (ingress.sourceSecurityGroupId) {
        securityGroupIngress.sourceSecurityGroupId = ingress.sourceSecurityGroupId();
      }
    }
  }

  private createSecurityGroupEgress(scope: Construct, securityGroupInfo: SecurityGroupInfo) {
    if (securityGroupInfo.egresses) {
      for (const egress of securityGroupInfo.egresses) {
        new CfnSecurityGroupEgress(scope, egress.id, {
          ipProtocol: egress.ipProtocol,
          cidrIp: egress.cidrIp,
          fromPort: egress.fromPort,
          toPort: egress.toPort,
          groupId: this.ec2.attrGroupId
        });
      }
    }
  }
}
