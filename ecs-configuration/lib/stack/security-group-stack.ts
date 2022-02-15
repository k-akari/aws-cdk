import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup } from '../resource/security-group';

export class SecurityGroupStack extends Stack {
  public readonly sg: SecurityGroup;

  constructor(scope: Construct, id: string, vpc: Vpc, props?: StackProps) {
    super(scope, id, props);

    this.sg = new SecurityGroup(this, vpc);
  }
}
