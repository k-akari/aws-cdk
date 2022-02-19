import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class VPC extends Resource {
  public readonly vpc: Vpc;

  constructor(scope: Construct) {
    super();

    // Create a VPC
    this.vpc = new Vpc(scope, 'Vpc', {
      vpcName: this.createResourceName(scope, 'vpc'),
      cidr: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 99,
      subnetConfiguration: []
    });
  };
}
