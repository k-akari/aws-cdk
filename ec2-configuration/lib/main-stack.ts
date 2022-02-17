import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkStack } from './stack/network-stack';
import { SecurityGroupStack } from './stack/security-group-stack';
import { IamStack } from './stack/iam-stack';
import { ServerStack } from './stack/server-stack';
import { LoadBalancerStack } from './stack/load-balancer-stack';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, 'NetworkStack', {
      stackName: 'network-stack'
    });

    const securityGroupStack = new SecurityGroupStack(scope, 'SecurityGroupStack', networkStack.vpc, {
      stackName: 'security-group-stack'
    });

    const iamStack = new IamStack(scope, 'IamStack', {
      stackName: 'iam-stack'
    });

    const serverStack = new ServerStack(scope, 'ServerStack', networkStack.subnet.private1a, iamStack.iamRole.instanceProfile, securityGroupStack.sg.ec2, {
      stackName: 'server-stack'
    });

    new LoadBalancerStack(scope, 'LoadBalancerStack', networkStack.vpc, networkStack.subnet.private1a, securityGroupStack.sg.alb, serverStack.ec2.mainInstance, {
      stackName: 'load-balancer-stack'
    });
  }
}
