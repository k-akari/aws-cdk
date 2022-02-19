import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnSubnet, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { Ec2 } from '../resource/ec2';
import { ElasticIp } from '../resource/elastic-ip';

export class ServerStack extends Stack {
  public readonly ec2: Ec2

  constructor(scope: Construct, id: string, subnet: CfnSubnet, instanceProfile: CfnInstanceProfile, securityGroup: CfnSecurityGroup, props?: StackProps) {
    super(scope, id, props);

    this.ec2 = new Ec2(this, subnet, instanceProfile, securityGroup);
    new ElasticIp().associateElasticIp(this, this.ec2.mainInstance, 'ec2-1a');
  }
}
