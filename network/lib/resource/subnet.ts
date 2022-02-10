import { Construct } from 'constructs';
import { CfnVPC, CfnSubnet } from 'aws-cdk-lib/aws-ec2';

export class Subnet {
  public subnetPublic1a: CfnSubnet;
  public subnetPublic1c: CfnSubnet;
  public subnetPublic1d: CfnSubnet;
  public subnetPrivate1a: CfnSubnet;
  public subnetPrivate1c: CfnSubnet;
  public subnetPrivate1d: CfnSubnet;

  private readonly vpc: CfnVPC;

  constructor(vpc: CfnVPC) {
      this.vpc = vpc;
  };

  public createResources(scope: Construct) {
    const envType = scope.node.tryGetContext('envType');
    const serviceName = scope.node.tryGetContext('serviceName');

    // Public Subnets
    this.subnetPublic1a = new CfnSubnet(scope, 'SubnetPublic1a', {
      cidrBlock: '10.0.10.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1a` }]
    })
    this.subnetPublic1c = new CfnSubnet(scope, 'SubnetPublic1c', {
      cidrBlock: '10.0.11.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1c` }]
    })
    this.subnetPublic1d = new CfnSubnet(scope, 'SubnetPublic1d', {
      cidrBlock: '10.0.12.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1d',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1a` }]
    })

    // Private Subnets
    const subnetPrivate1a = new CfnSubnet(scope, 'SubnetPrivate1a', {
      cidrBlock: '10.0.100.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1a` }]
    })
    const subnetPrivate1c = new CfnSubnet(scope, 'SubnetPrivate1c', {
      cidrBlock: '10.0.101.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1c` }]
    })
    const subnetPrivate1d = new CfnSubnet(scope, 'SubnetPrivate1d', {
      cidrBlock: '10.0.102.0/24',
      vpcId: this.vpc.ref,
      availabilityZone: 'ap-northeast-1d',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1d` }]
    })
  }
}
