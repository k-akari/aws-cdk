import { Construct } from 'constructs';
import { CfnNetworkAcl, CfnNetworkAclEntry, CfnSubnetNetworkAclAssociation } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Subnet } from './subnet';

export class NetworkAcl extends Resource {
  public public: CfnNetworkAcl;

  private readonly vpc: Vpc;
  private readonly subnet: Subnet;

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet)
  {
    super();

    this.vpc = vpc;
    this.subnet = subnet;

    this.public = this.createPublicNetworkAcl(scope);
  }

  private createPublicNetworkAcl(scope: Construct): CfnNetworkAcl {
    // Create Network ACL
    const networkAcl = new CfnNetworkAcl(scope, 'NetworkAclPublic', {
      vpcId: this.vpc.vpcId,
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'nacl-public')}]
    });

    // Create Inbound Rules and Associate them with Network ACL
    new CfnNetworkAclEntry(scope, 'NetworkAclEntryInboundPublic', {
      networkAclId: networkAcl.ref,
      protocol: -1,
      ruleAction: 'allow',
      ruleNumber: 100,
      cidrBlock: '0.0.0.0/0',
      egress: false
    });

    // Create Outbound Rules and Associate them with Network ACL
    new CfnNetworkAclEntry(scope, 'NetworkAclEntryOutboundPublic', {
      networkAclId: networkAcl.ref,
      protocol: -1,
      ruleAction: 'allow',
      ruleNumber: 100,
      cidrBlock: '0.0.0.0/0',
      egress: true
    });

    // Associate the created Network ACL with public subnet of 1a
    new CfnSubnetNetworkAclAssociation(scope, 'NetworkAclAssociationPublic1a', {
      networkAclId: networkAcl.ref,
      subnetId: this.subnet.public1a.ref
    });

    // Associate the created Network ACL with public subnet of 1c
    new CfnSubnetNetworkAclAssociation(scope, 'NetworkAclAssociationPublic1c', {
      networkAclId: networkAcl.ref,
      subnetId: this.subnet.public1c.ref
    });

    return networkAcl;
  }
}
