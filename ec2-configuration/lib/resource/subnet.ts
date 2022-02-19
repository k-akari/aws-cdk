import { Construct } from 'constructs';
import { CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class Subnet extends Resource {
  public public1a: CfnSubnet;
  public public1c: CfnSubnet;
  private readonly vpc: Vpc;

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    // Create Public Subnet in AZ 1a
    this.public1a = new CfnSubnet(scope, 'SubnetPublic1a', {
      cidrBlock: '10.0.10.0/24',
      vpcId: this.vpc.vpcId,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-public-1a') }]
    });

    // Create Public Subnet in AZ 1c
    this.public1c = new CfnSubnet(scope, 'SubnetPublic1c', {
      cidrBlock: '10.0.11.0/24',
      vpcId: this.vpc.vpcId,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-public-1c') }]
    });
  };
}
