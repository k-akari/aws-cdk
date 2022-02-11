import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './resource/vpc';
import { Subnet } from './resource/subnet';
import { InternetGateway } from './resource/internetGateway';
import { ElasticIp } from './resource/elasticIp';
import { NatGateway } from './resource/natGateway';
import { RouteTable } from './resource/routeTable';
import { NetworkAcl } from './resource/networkAcl';

export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    // VPC
    const vpc = new Vpc();
    vpc.createResources(this);

    // Subnet
    const subnet = new Subnet(vpc.vpc);
    subnet.createResources(this);

    // Internet Gateway
    const internetGateway = new InternetGateway(vpc.vpc);
    internetGateway.createResources(this);

    // Elastic IP
    const elasticIp = new ElasticIp();
    elasticIp.createResources(this);

    // NAT Gateway
    const natGateway = new NatGateway(
      subnet.subnetPublic1a,
      subnet.subnetPublic1c,
      elasticIp.ngw1a,
      elasticIp.ngw1c
    );
    natGateway.createResources(this);

    // Route Table
    const routeTable = new RouteTable(
      vpc.vpc,
      subnet.subnetPublic1a,
      subnet.subnetPublic1c,
      subnet.subnetPrivate1a,
      subnet.subnetPrivate1c,
      internetGateway.igw,
      natGateway.ngw1a,
      natGateway.ngw1c
    );
    routeTable.createResources(this);

    // Network ACL
    const networkAcl = new NetworkAcl(
      vpc.vpc,
      subnet.subnetPublic1a,
      subnet.subnetPublic1c,
      subnet.subnetPrivate1a,
      subnet.subnetPrivate1c
    );
    networkAcl.createResources(this);
  }
}
