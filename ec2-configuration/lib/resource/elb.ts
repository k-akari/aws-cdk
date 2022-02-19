import { Construct } from 'constructs';
import { CfnLoadBalancer, CfnTargetGroup, CfnListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Vpc, CfnSubnet, CfnInstance, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Elb extends Resource {
  constructor(scope: Construct, vpc: Vpc, subnets: CfnSubnet[], sg: CfnSecurityGroup, ec2: CfnInstance) {
    super();

    // Create an Application Load Balancer
    const loadBalancer = new CfnLoadBalancer(scope, 'Alb', {
      ipAddressType: 'ipv4',
      name: this.createResourceName(scope, 'alb'),
      scheme: 'internet-facing',
      securityGroups: [sg.attrGroupId],
      subnets: subnets.map(subnet=>subnet.ref),
      type: 'application'
    });

    // Create a Target Group
    const targetGroup = new CfnTargetGroup(scope, 'AlbTargetGroup', {
      name: this.createResourceName(scope, 'tg'),
      port: 80,
      protocol: 'HTTP',
      targetType: 'instance',
      targets: [{ id: ec2.ref }],
      vpcId: vpc.vpcId
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
