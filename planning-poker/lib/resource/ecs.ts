import { Construct } from 'constructs';
import { Cluster } from 'aws-cdk-lib/aws-ecs';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

export class Ecs extends Resource {
  private readonly vpc: Vpc;

  constructor(scope: Construct, vpc: Vpc) {
    super();

    this.vpc = vpc;

    const cluster = this.createCluster(scope, vpc);
  }

  private createCluster(scope: Construct, vpc: Vpc): Cluster {
    const cluster = new Cluster(scope, 'EcsCluster', {
      clusterName: this.createResourceName(scope, 'ecs-cluster'),
      containerInsights: true,
      vpc
    });

    return cluster;
  }
}