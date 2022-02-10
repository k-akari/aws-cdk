import { Construct } from 'constructs';
import { CfnVPC, CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Subnet extends Resource {
  public subnetPublic1a: CfnSubnet;
  public subnetPublic1c: CfnSubnet;
  public subnetPrivate1a: CfnSubnet;
  public subnetPrivate1c: CfnSubnet;

  private readonly vpc: CfnVPC;

  constructor(vpc: CfnVPC) {
    super();
    this.vpc = vpc;
  };

  public createResources(scope: Construct) {
    // Public Subnets
    this.subnetPublic1a = new CfnSubnet(scope, 'SubnetPublic1a', {
      cidrBlock: '10.0.10.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-public-1a') }]
    })
    this.subnetPublic1c = new CfnSubnet(scope, 'SubnetPublic1c', {
      cidrBlock: '10.0.11.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-public-1c') }]
    })

    // Private Subnets
    const subnetPrivate1a = new CfnSubnet(scope, 'SubnetPrivate1a', {
      cidrBlock: '10.0.100.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-private-1a') }]
    })
    const subnetPrivate1c = new CfnSubnet(scope, 'SubnetPrivate1c', {
      cidrBlock: '10.0.101.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-private-1c') }]
    })
  }
}
