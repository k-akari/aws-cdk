import { Construct } from 'constructs';
import { CfnInternetGateway, CfnVPCGatewayAttachment, CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';
import { Vpc } from './vpc';

export class InternetGateway extends Resource {
  public igw: CfnInternetGateway;

  private readonly vpc: Vpc;

  constructor(scope: Construct, vpc: Vpc) {
    super();
  
    this.vpc = vpc;

    this.igw = new CfnInternetGateway(scope, 'InternetGateway', {
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'igw') }]
    });

    new CfnVPCGatewayAttachment(scope, 'VpcGatewayAttachment', {
      vpcId: this.vpc.vpc.ref,
      internetGatewayId: this.igw.ref
    });
  }
}