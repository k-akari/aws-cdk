import { Construct } from 'constructs';
import { CfnNatGateway } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Subnet } from './subnet';
import { ElasticIp } from './elasticIp';

interface ResourceInfo {
  readonly id: string;
  readonly resourceName: string;
  readonly allocationId: () => string;
  readonly subnetId: () => string;
  readonly assign: (natGateway: CfnNatGateway) => void;
}

export class NatGateway extends Resource {
  public ngw1a: CfnNatGateway;
  public ngw1c: CfnNatGateway;

  private readonly subnet: Subnet;
  private readonly elasticIp: ElasticIp;
  private readonly resources: ResourceInfo[] = [
    {
      id: 'NatGateway1a',
      resourceName: 'ngw-1a',
      allocationId: () => this.elasticIp.ngw1a.attrAllocationId,
      subnetId: () => this.subnet.public1a.ref,
      assign: natGateway => this.ngw1a = natGateway
    },
    {
      id: 'NatGateway1c',
      resourceName: 'ngw-1c',
      allocationId: () => this.elasticIp.ngw1c.attrAllocationId,
      subnetId: () => this.subnet.public1c.ref,
      assign: natGateway => this.ngw1c = natGateway
    }
  ];

  constructor(scope: Construct, subnet: Subnet, elasticIp: ElasticIp)
  {
    super();

    this.subnet = subnet;
    this.elasticIp = elasticIp;

    for (const resourceInfo of this.resources) {
      const natGateway = this.createNatGateway(scope, resourceInfo);
      resourceInfo.assign(natGateway);
    }
  };

  private createNatGateway(scope: Construct, resourceInfo: ResourceInfo): CfnNatGateway {
    const natGateway = new CfnNatGateway(scope, resourceInfo.id, {
      allocationId: resourceInfo.allocationId(),
      subnetId: resourceInfo.subnetId(),
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, resourceInfo.resourceName)
      }]
    });
    return natGateway;
  }
}
