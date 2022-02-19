import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstance } from 'aws-cdk-lib/aws-ec2';
import { Elb } from '../resource/elb';
import { Subnet } from '../resource/subnet';

export class LoadBalancerStack extends Stack {
  constructor(scope: Construct, id: string, vpc: Vpc, subnet: Subnet, sg: CfnSecurityGroup, ec2Instance: CfnInstance, props?: StackProps) {
    super(scope, id, props);
   
    new Elb(this, vpc, subnet, sg, ec2Instance);
  }
}
