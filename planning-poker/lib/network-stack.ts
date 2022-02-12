import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from './resource/vpc';
import { Subnet } from './resource/subnet';
import { InternetGateway } from './resource/internet-gateway';
import { ElasticIp } from './resource/elastic-ip';
import { NatGateway } from './resource/nat-gateway';
import { RouteTable } from './resource/route-table';
import { NetworkAcl } from './resource/network-acl';

export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    const vpc = new Vpc(this);
    const subnet = new Subnet(this, vpc);
    const internetGateway = new InternetGateway(this, vpc);
    const elasticIp = new ElasticIp(this);
    const natGateway = new NatGateway(this, subnet, elasticIp);
    new RouteTable(this, vpc, subnet, internetGateway, natGateway);
    new NetworkAcl(this, vpc, subnet);
  }
}
