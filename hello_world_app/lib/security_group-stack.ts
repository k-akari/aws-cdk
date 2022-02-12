import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecurityGroup } from './resource/securityGroup';
import { NetworkStack } from '../../network/lib/network-stack';

export class SecurityGroupStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, 'NetworkStack', {
      stackName: 'network-stack'
    });

    // Security Group
    const securityGroup = new SecurityGroup(networkStack.);
    securityGroup.createResources(this);
  }
}
