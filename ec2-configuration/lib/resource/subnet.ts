import { Construct } from 'constructs';
import { CfnSubnet } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

interface SubnetInfo {
  readonly id: string;
  readonly cidrBlock: string;
  readonly availabilityZone: string;
  readonly name: string;
  readonly assign: (subnet: CfnSubnet) => void;
}

export class Subnet extends Resource {
  public public1a: CfnSubnet;
  public public1c: CfnSubnet;

  private readonly vpc: Vpc;
  private readonly subnetInfos: SubnetInfo[] = [
    {
      id: 'SubnetPublic1a',
      cidrBlock: '10.0.10.0/24',
      availabilityZone: 'ap-northeast-1a',
      name: 'subnet-public-1a',
      assign: subnet => (this.public1a as CfnSubnet) = subnet
    },
    {
      id: 'SubnetPublic1c',
      cidrBlock: '10.0.11.0/24',
      availabilityZone: 'ap-northeast-1c',
      name: 'subnet-public-1c',
      assign: subnet => (this.public1c as CfnSubnet) = subnet
    }
  ]

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    for (const subnetInfo of this.subnetInfos) {
      const subnet = this.createSubnet(scope, subnetInfo);
      subnetInfo.assign(subnet);
    }
  };

  private createSubnet(scope: Construct, subnetInfo: SubnetInfo): CfnSubnet {
    const subnet = new CfnSubnet(scope, subnetInfo.id, {
      cidrBlock: subnetInfo.cidrBlock,
      vpcId: this.vpc.vpcId,
      availabilityZone: subnetInfo.availabilityZone,
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, subnetInfo.name)
      }]
    });

    return subnet;
  }
}
