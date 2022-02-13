import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from '../resource/vpc';
import { SecurityGroup } from '../resource/security-group';

export class SecurityGroupStack extends Stack {
  constructor(scope: Construct, id: string, vpc: Vpc, props?: StackProps) {
    super(scope, id, props);

    // Security Group
    const securityGroup = new SecurityGroup(vpc);
    securityGroup.createResources(this);
  }
}
