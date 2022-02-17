import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnSubnet, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { Ec2 } from '../resource/ec2';

export class ServerStack extends Stack {
  constructor(scope: Construct, id: string, subnet: CfnSubnet, instanceProfile: CfnInstanceProfile, securityGroup: CfnSecurityGroup, props?: StackProps) {
    super(scope, id, props);

    new Ec2(this, subnet, instanceProfile, securityGroup);
  }
}
