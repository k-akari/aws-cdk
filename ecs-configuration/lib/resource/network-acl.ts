import { Construct } from 'constructs';
import { CfnNetworkAcl, CfnNetworkAclEntry, CfnSubnetNetworkAclAssociation } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Subnet } from './subnet';

interface AssociationInfo {
  readonly id: string;
  readonly subnetId: () => string;
}

interface ResourceInfo {
  readonly id: string;
  readonly resourceName: string;
  readonly entryIdInbound: string;
  readonly entryIdOutbound: string;
  readonly associations: AssociationInfo[];
  readonly assign: (networkAcl: CfnNetworkAcl) => void;
}

export class NetworkAcl extends Resource {
  public public: CfnNetworkAcl;
  public private: CfnNetworkAcl;

  private readonly vpc: Vpc;
  private readonly subnet: Subnet;
  private readonly resources: ResourceInfo[] = [
    {
      id: 'NetworkAclPublic',
      resourceName: 'nacl-public',
      entryIdInbound: 'NetworkAclEntryInboundPublic',
      entryIdOutbound: 'NetworkAclEntryOutboundPublic',
      associations: [
        {
            id: 'NetworkAclAssociationPublic1a',
            subnetId: () => this.subnet.public1a.ref
        },
        {
            id: 'NetworkAclAssociationPublic1c',
            subnetId: () => this.subnet.public1c.ref
        }
      ],
      assign: networkAcl => this.public = networkAcl
    },
    {
      id: 'NetworkAclPrivate',
      resourceName: 'nacl-private',
      entryIdInbound: 'NetworkAclEntryInboundPrivate',
      entryIdOutbound: 'NetworkAclEntryOutboundPrivate',
      associations: [
        {
          id: 'NetworkAclAssociationPrivate1a',
          subnetId: () => this.subnet.private1a.ref
        },
        {
          id: 'NetworkAclAssociationPrivate1c',
          subnetId: () => this.subnet.private1c.ref
        }
      ],
      assign: networkAcl => this.private = networkAcl
    }
  ];

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet)
  {
    super();

    this.vpc = vpc;
    this.subnet = subnet;

    for (const resourceInfo of this.resources) {
      const networkAcl = this.createNetworkAcl(scope, resourceInfo);
      resourceInfo.assign(networkAcl);
    }
  }

  private createNetworkAcl(scope: Construct, resourceInfo: ResourceInfo): CfnNetworkAcl {
    const networkAcl = new CfnNetworkAcl(scope, resourceInfo.id, {
      vpcId: this.vpc.vpcId,
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, resourceInfo.resourceName)
      }]
    });
    this.createEntry(scope, resourceInfo.entryIdInbound, networkAcl, false);
    this.createEntry(scope, resourceInfo.entryIdOutbound, networkAcl, true);
    for (const associationInfo of resourceInfo.associations) {
      this.createAssociation(scope, associationInfo, networkAcl);
    }
    return networkAcl;
  }

  private createEntry(scope: Construct, id: string, networkAcl: CfnNetworkAcl, egress: boolean) {
    new CfnNetworkAclEntry(scope, id, {
      networkAclId: networkAcl.ref,
      protocol: -1,
      ruleAction: 'allow',
      ruleNumber: 100,
      cidrBlock: '0.0.0.0/0',
      egress: egress
    });
  }

  private createAssociation(scope: Construct, associationInfo: AssociationInfo, networkAcl: CfnNetworkAcl) {
    new CfnSubnetNetworkAclAssociation(scope, associationInfo.id, {
      networkAclId: networkAcl.ref,
      subnetId: associationInfo.subnetId()
    });
  }
}
