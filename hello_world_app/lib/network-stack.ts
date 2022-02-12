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
    const vpc = new Vpc(this);

    // Subnet
    const subnet = new Subnet(this, vpc);

    // Internet Gateway
    const internetGateway = new InternetGateway(this, vpc);

    // Elastic IP
    const elasticIp = new ElasticIp(this);

    // NAT Gateway
    const natGateway = new NatGateway(this, subnet, elasticIp);

    // Route Table
    const routeTable = new RouteTable(this, vpc, subnet, internetGateway, natGateway);

    // Network ACL
    const networkAcl = new NetworkAcl(this, vpc, subnet);
  }
}
