import { Construct } from 'constructs';
import { CfnVPC } from 'aws-cdk-lib/aws-ec2';

export class Vpc {
  public vpc: CfnVPC;

  constructor() { };

  public createResources(scope: Construct) {
    const envType = scope.node.tryGetContext('envType');
    const serviceName = scope.node.tryGetContext('serviceName');

    this.vpc = new CfnVPC(scope, 'Vpc', {
      cidrBlock: '10.0.0.0/16',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-vpc` },
             { key: 'Env', value: envType },
             { key: 'Service', value: serviceName }],
      enableDnsHostnames: true,
      enableDnsSupport: true
    });
  }
}
