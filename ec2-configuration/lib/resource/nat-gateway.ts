import { Construct } from 'constructs';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Subnet } from './subnet';
import { ElasticIp } from './elastic-ip';

interface NatGatewayInfo {
  readonly id: string;
  readonly name: string;
  readonly allocationId: () => string;
  readonly subnetId: () => string;
  readonly assign: (natGateway: CfnNatGateway) => void;
}

export class NatGateway extends Resource {
  public ngw1a: CfnNatGateway;

  private readonly subnet: Subnet;
  private readonly elasticIp: ElasticIp;
  private readonly natGatewayInfos: NatGatewayInfo[] = [
    {
      id: 'NatGateway1a',
      name: 'ngw-1a',
      allocationId: () => this.elasticIp.ngw1a.attrAllocationId,
      subnetId: () => this.subnet.public1a.ref,
      assign: natGateway => this.ngw1a = natGateway
    }
  ];

  constructor(scope: Construct, subnet: Subnet, elasticIp: ElasticIp)
  {
    super();

    this.subnet = subnet;
    this.elasticIp = elasticIp;

    for (const natGatewayInfo of this.natGatewayInfos) {
      const natGateway = this.createNatGateway(scope, natGatewayInfo);
      natGatewayInfo.assign(natGateway);
    }
  };

  private createNatGateway(scope: Construct, natGatewayInfo: NatGatewayInfo): CfnNatGateway {
    const natGateway = new CfnNatGateway(scope, natGatewayInfo.id, {
      allocationId: natGatewayInfo.allocationId(),
      subnetId: natGatewayInfo.subnetId(),
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, natGatewayInfo.name)
      }]
    });
    return natGateway;
  }
}
