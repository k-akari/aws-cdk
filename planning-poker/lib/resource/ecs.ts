import { Construct } from 'constructs';
import { Cluster, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { IamRole } from './iam-role';

export class Ecs extends Resource {
  private readonly vpc: Vpc;
  private readonly iamRole: IamRole;

  constructor(scope: Construct, vpc: Vpc, iamRole: IamRole) {
    super();

    this.vpc = vpc;
    this.iamRole = iamRole

    const cluster = this.createCluster(scope);
    const taskDefinition = this.createTaskDefinition(scope)
  }

  private createCluster(scope: Construct): Cluster {
    const cluster = new Cluster(scope, 'EcsCluster', {
      clusterName: this.createResourceName(scope, 'ecs-cluster'),
      containerInsights: true,
      vpc: this.vpc
    });

    return cluster;
  }

  private createTaskDefinition(scope: Construct): FargateTaskDefinition {
    const serviceTaskDefinition = new FargateTaskDefinition(scope, 'ServiceTaskDefinition', {
      family: this.createResourceName(scope, 'task-definition'),
      cpu: 256,
      memoryLimitMiB: 2048,
      executionRole: this.iamRole.ecsTaskRole,
      taskRole: this.iamRole.ecsTaskExecutionRole,
    });

    return serviceTaskDefinition;
  }
}