import { Construct } from 'constructs';
import { CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from './vpc';

interface ResourceInfo {
  readonly id: string;
  readonly cidrBlock: string;
  readonly availabilityZone: string;
  readonly resourceName: string;
  readonly assign: (subnet: CfnSubnet) => void;
}

export class Subnet extends Resource {
  public public1a: CfnSubnet;
  public public1c: CfnSubnet;
  public private1a: CfnSubnet;
  public private1c: CfnSubnet;

  private readonly vpc: Vpc;
  private readonly resources: ResourceInfo[] = [
    {
      id: 'SubnetPublic1a',
      cidrBlock: '10.0.10.0/24',
      availabilityZone: 'ap-northeast-1a',
      resourceName: 'subnet-public-1a',
      assign: subnet => (this.public1a as CfnSubnet) = subnet
    },
    {
      id: 'SubnetPublic1c',
      cidrBlock: '10.0.11.0/24',
      availabilityZone: 'ap-northeast-1c',
      resourceName: 'subnet-public-1c',
      assign: subnet => (this.public1c as CfnSubnet) = subnet
    },
    {
      id: 'SubnetPrivate1a',
      cidrBlock: '10.0.100.0/24',
      availabilityZone: 'ap-northeast-1a',
      resourceName: 'subnet-private-1a',
      assign: subnet => (this.private1a as CfnSubnet) = subnet
    },
    {
      id: 'SubnetPrivate1c',
      cidrBlock: '10.0.101.0/24',
      availabilityZone: 'ap-northeast-1c',
      resourceName: 'subnet-private-1c',
      assign: subnet => (this.private1c as CfnSubnet) = subnet
    },
  ]

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    for (const resourceInfo of this.resources) {
      const subnet = this.createSubnet(scope, resourceInfo);
      resourceInfo.assign(subnet);
    }
  };

  private createSubnet(scope: Construct, resourceInfo: ResourceInfo): CfnSubnet {
    const subnet = new CfnSubnet(scope, resourceInfo.id, {
      cidrBlock: resourceInfo.cidrBlock,
      vpcId: this.vpc.vpc.ref,
      availabilityZone: resourceInfo.availabilityZone,
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, resourceInfo.resourceName)
      }]
    });

    return subnet;
  }
}
