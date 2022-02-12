import { Construct } from 'constructs';
import { CfnRouteTable, CfnRoute, CfnSubnetRouteTableAssociation } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Subnet } from './subnet';
import { InternetGateway } from './internet-gateway';
import { NatGateway } from './nat-gateway';
import { Vpc } from './vpc';

interface RouteInfo {
  readonly id: string;
  readonly destinationCidrBlock: string;
  readonly gatewayId?: () => string;
  readonly natGatewayId?: () => string;
}

interface AssociationInfo {
  readonly id: string;
  readonly subnetId: () => string;
}

interface ResourceInfo {
  readonly id: string;
  readonly resourceName: string;
  readonly routes: RouteInfo[];
  readonly associations: AssociationInfo[];
  readonly assign: (routeTable: CfnRouteTable) => void;
}

export class RouteTable extends Resource {
  public public: CfnRouteTable;
  public private1a: CfnRouteTable;
  public private1c: CfnRouteTable;

  private readonly vpc: Vpc;
  private readonly subnet: Subnet;
  private readonly internetGateway: InternetGateway;
  private readonly natGateway: NatGateway;
  private readonly resources: ResourceInfo[] = [
    {
      id: 'RouteTablePublic',
      resourceName: 'rtb-public',
      routes: [{
        id: 'RoutePublic',
        destinationCidrBlock: '0.0.0.0/0',
        gatewayId: () => this.internetGateway.igw.ref
      }],
      associations: [
        {
          id: 'AssociationPublic1a',
          subnetId: () => this.subnet.public1a.ref
        },
        {
          id: 'AssociationPublic1c',
          subnetId: () => this.subnet.public1c.ref
        }
      ],
      assign: routeTable => this.public = routeTable
    },
    {
      id: 'RouteTablePrivate1a',
      resourceName: 'rtb-private-1a',
      routes: [{
        id: 'RoutePrivate1a',
        destinationCidrBlock: '0.0.0.0/0',
        natGatewayId: () => this.natGateway.ngw1a.ref
      }],
      associations: [{
        id: 'AssociationPrivate1a',
        subnetId: () => this.subnet.private1a.ref
      }],
      assign: routeTable => this.private1a = routeTable
    },
    {
      id: 'RouteTablePrivate1c',
      resourceName: 'rtb-private-1c',
      routes: [{
        id: 'RoutePrivate1c',
        destinationCidrBlock: '0.0.0.0/0',
        natGatewayId: () => this.natGateway.ngw1c.ref
      }],
      associations: [{
        id: 'AssociationPrivate1c',
        subnetId: () => this.subnet.private1c.ref
      }],
      assign: routeTable => this.private1c = routeTable
    }
  ];

  constructor(scope: Construct, vpc: Vpc, subnet: Subnet, internetGateway: InternetGateway, natGateway: NatGateway
  ) {
    super();

    this.vpc = vpc;
    this.subnet = subnet;
    this.internetGateway = internetGateway;
    this.natGateway = natGateway;

    for (const resourceInfo of this.resources) {
      const routeTable = this.createRouteTable(scope, resourceInfo);
      resourceInfo.assign(routeTable);
    }
  }

  private createRouteTable(scope: Construct, resourceInfo: ResourceInfo): CfnRouteTable {
    const routeTable = new CfnRouteTable(scope, resourceInfo.id, {
      vpcId: this.vpc.vpc.ref,
      tags: [{
        key: 'Name',
        value: this.createResourceName(scope, resourceInfo.resourceName)
      }]
    });

    for (const routeInfo of resourceInfo.routes) {
      this.createRoute(scope, routeInfo, routeTable);
    }

    for (const associationInfo of resourceInfo.associations) {
      this.createAssociation(scope, associationInfo, routeTable);
    }

    return routeTable;
  }

  private createRoute(scope: Construct, routeInfo: RouteInfo, routeTable: CfnRouteTable) {
    const route = new CfnRoute(scope, routeInfo.id, {
      routeTableId: routeTable.ref,
      destinationCidrBlock: routeInfo.destinationCidrBlock
    });

    if (routeInfo.gatewayId) {
      route.gatewayId = routeInfo.gatewayId();
    } else if (routeInfo.natGatewayId) {
      route.natGatewayId = routeInfo.natGatewayId();
    }
  }

  private createAssociation(scope: Construct, associationInfo: AssociationInfo, routeTable: CfnRouteTable) {
    new CfnSubnetRouteTableAssociation(scope, associationInfo.id, {
      routeTableId: routeTable.ref,
      subnetId: associationInfo.subnetId()
    });
  }
}
