import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup } from '../resource/security-group';

export class SecurityGroupStack extends Stack {
  constructor(scope: Construct, id: string, vpc: CfnVPC, props?: StackProps) {
    super(scope, id, props);

    // Security Group
    const securityGroup = new SecurityGroup(vpc);
    securityGroup.createResources(this);
  }
}
