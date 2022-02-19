import { Construct } from 'constructs';
import { Vpc, CfnRouteTable, CfnRoute, CfnSubnetRouteTableAssociation, CfnInternetGateway } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Subnet } from './subnet';

export class RouteTable extends Resource {
  public public: CfnRouteTable;

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet, igw: CfnInternetGateway) {
    super();

    // Create a Route Table
    const routeTable = new CfnRouteTable(scope, 'RouteTablePublic', {
      vpcId: vpc.vpcId,
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'rtb-public') }]
    });

    // Create a Route to the Internet
    new CfnRoute(scope, 'RoutePublic', {
      routeTableId: routeTable.ref,
      destinationCidrBlock: '0.0.0.0/0',
      gatewayId: igw.ref
    });

    // Associate the Route Table with Public Subnets
    new CfnSubnetRouteTableAssociation(scope, 'AssociationPublic1a', {
      routeTableId: routeTable.ref,
      subnetId: subnet.public1a.ref
    });
    new CfnSubnetRouteTableAssociation(scope, 'AssociationPublic1c', {
      routeTableId: routeTable.ref,
      subnetId: subnet.public1c.ref
    });
  }
}
