import { Construct } from 'constructs';
import { CfnInternetGateway, CfnVPCGatewayAttachment, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class InternetGateway extends Resource {
  public igw: CfnInternetGateway;

  constructor(scope: Construct, vpc: Vpc) {
    super();

    // Create Internet Gateway
    this.igw = new CfnInternetGateway(scope, 'InternetGateway', {
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'igw') }]
    });

    // Attach the Internet Gateway to the VPC
    new CfnVPCGatewayAttachment(scope, 'VpcGatewayAttachment', {
      vpcId: vpc.vpcId,
      internetGatewayId: this.igw.ref
    });
  }
}