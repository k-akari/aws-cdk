import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { VPC } from '../resource/vpc';
import { Subnet } from '../resource/subnet';
import { InternetGateway } from '../resource/internet-gateway';
import { RouteTable } from '../resource/route-table';
import { NetworkAcl } from '../resource/network-acl';

export class NetworkStack extends Stack {
  public readonly vpc: Vpc;
  public readonly subnet: Subnet;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    const vpc = new VPC(this);
    this.vpc = vpc.vpc;
    this.subnet = new Subnet(this, this.vpc);
    const internetGateway = new InternetGateway(this, this.vpc);
    new RouteTable(this, this.vpc, this.subnet, internetGateway.igw);
    new NetworkAcl(this, this.vpc, this.subnet);
  }
}
