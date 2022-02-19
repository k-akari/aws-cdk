import { Construct } from 'constructs';
import { CfnLoadBalancer, CfnTargetGroup, CfnListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Resource } from './abstract/resource';
import { Vpc, CfnInstance, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Subnet } from './subnet';

export class Elb extends Resource {
  private readonly vpc: Vpc;
  private readonly subnet: Subnet;
  private readonly securityGroup: CfnSecurityGroup;
  private readonly ec2: CfnInstance;

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet, sg: CfnSecurityGroup, ec2: CfnInstance) {
    super();
  
    this.vpc = vpc;
    this.subnet = subnet;
    this.securityGroup = sg;
    this.ec2 = ec2;

    // Create an Application Load Balancer
    const loadBalancer = new CfnLoadBalancer(scope, 'Alb', {
      ipAddressType: 'ipv4',
      name: this.createResourceName(scope, 'alb'),
      scheme: 'internet-facing',
      securityGroups: [this.securityGroup.attrGroupId],
      subnets: [this.subnet.public1a.ref, this.subnet.public1c.ref],
      type: 'application'
    });

    // Create a Target Group
    const targetGroup = new CfnTargetGroup(scope, 'AlbTargetGroup', {
      name: this.createResourceName(scope, 'tg'),
      port: 80,
      protocol: 'HTTP',
      targetType: 'instance',
      targets: [{ id: this.ec2.ref }],
      vpcId: this.vpc.vpcId
    });

    // Create a Listner
    new CfnListener(scope, 'AlbListener', {
      defaultActions: [{
        type: 'forward',
        forwardConfig: {
          targetGroups: [{ targetGroupArn: targetGroup.ref, weight: 1 }]
        }
      }],
      loadBalancerArn: loadBalancer.ref,
      port: 80,
      protocol: 'HTTP'
    });
  }
}
