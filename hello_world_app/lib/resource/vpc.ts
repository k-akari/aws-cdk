import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class Vpc extends Resource {
  public readonly vpc: CfnVPC;

  constructor(scope: Construct) {
    super();

    this.vpc = new CfnVPC(scope, 'Vpc', {
      cidrBlock: '10.0.0.0/16',
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'vpc') }],
      enableDnsHostnames: true,
      enableDnsSupport: true
    });
  };
}
