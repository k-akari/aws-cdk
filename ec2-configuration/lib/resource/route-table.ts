import { Construct } from 'constructs';
import { CfnRouteTable, CfnRoute, CfnSubnetRouteTableAssociation } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Subnet } from './subnet';
import { InternetGateway } from './internet-gateway';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class RouteTable extends Resource {
  public public: CfnRouteTable;

  private readonly vpc: Vpc;
  private readonly subnet: Subnet;
  private readonly internetGateway: InternetGateway;

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet, internetGateway: InternetGateway)
  {
    super();

    this.vpc = vpc;
    this.subnet = subnet;
    this.internetGateway = internetGateway;

    // Create a Route Table
    const routeTable = new CfnRouteTable(scope, 'RouteTablePublic', {
      vpcId: this.vpc.vpcId,
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'rtb-public') }]
    });

    // Create a Route to the Internet
    new CfnRoute(scope, 'RoutePublic', {
      routeTableId: routeTable.ref,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: this.internetGateway.igw.ref
    });

    // Associate the Route Table with Public Subnets
    new CfnSubnetRouteTableAssociation(scope, 'AssociationPublic1a', {
      routeTableId: routeTable.ref,
      subnetId: this.subnet.public1a.ref
    });
    new CfnSubnetRouteTableAssociation(scope, 'AssociationPublic1c', {
      routeTableId: routeTable.ref,
      subnetId: this.subnet.public1c.ref
    });
  }
}
