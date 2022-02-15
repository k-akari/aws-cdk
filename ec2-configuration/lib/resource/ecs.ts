import { Construct } from 'constructs';
import { Cluster, FargateTaskDefinition, ContainerImage, Protocol } from 'aws-cdk-lib/aws-ecs';
import { Resource } from './abstract/resource';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { IamRole } from './iam-role';

interface ContainerDefinitionInfo {
  readonly id: string;
  readonly name: string;
  readonly image: ContainerImage;
  readonly entryPoint?: string[];
  readonly command?: string[];
  readonly port?: number;
};

interface TaskDefinitionInfo {
  readonly id: string;
  readonly family: string;
  readonly cpu: number;
  readonly memoryLimitMiB?: number;
  readonly containerDefinitions: ContainerDefinitionInfo[];
  readonly assign: (taskDefinition: FargateTaskDefinition) => void;
};

export class Ecs extends Resource {
  public serviceTaskDefinition: FargateTaskDefinition;
  public migrationTaskDefinition: FargateTaskDefinition;

  private readonly vpc: Vpc;
  private readonly iamRole: IamRole;
  private readonly taskDefinitionsInfo: TaskDefinitionInfo[] = [
    {
      id: 'ServiceTaskDefinition',
      family: 'service',
      cpu: 256,
      memoryLimitMiB: 2048,
      containerDefinitions: [
        {
          id: 'container-service-app',
          name: 'container-service-app',
          image: ContainerImage.fromRegistry('/aws/aws-example-app'),
          port: 80,
        },
        {
          id: 'container-service-web',
          name: 'container-service-web',
          image: ContainerImage.fromRegistry('/aws/aws-example-app'),
          port: 3000
        }
      ],
      assign: taskDefinition => this.serviceTaskDefinition = taskDefinition
    },
    {
      id: 'MigrationTaskDefinition',
      family: 'migration',
      cpu: 256,
      memoryLimitMiB: 2048,
      containerDefinitions: [
        {
          id: 'container-migration-app',
          name: 'container-migration-app',
          image: ContainerImage.fromRegistry('/aws/aws-example-app'),
          entryPoint: [ 'bundle', 'exec' ],
          command: [ 'rails', 'db:migrate' ],
        }
      ],
      assign: taskDefinition => this.migrationTaskDefinition = taskDefinition
    }
  ];

  constructor(scope: Construct, vpc: Vpc, iamRole: IamRole) {
    super();

    this.vpc = vpc;
    this.iamRole = iamRole;

    const cluster = this.createCluster(scope);

    for (const taskDefinitionInfo of this.taskDefinitionsInfo) {
      const taskDefinition = this.createTaskDefinition(scope, taskDefinitionInfo);
      taskDefinitionInfo.assign(taskDefinition);
    }
  }

  private createCluster(scope: Construct): Cluster {
    const cluster = new Cluster(scope, 'EcsCluster', {
      clusterName: this.createResourceName(scope, 'ecs-cluster'),
      containerInsights: true,
      vpc: this.vpc
    });

    return cluster;
  }

  private createTaskDefinition(scope: Construct, taskDefinitionInfo: TaskDefinitionInfo): FargateTaskDefinition {
    const taskDefinition = new FargateTaskDefinition(scope, taskDefinitionInfo.id, {
      family: this.createResourceName(scope, taskDefinitionInfo.family),
      cpu: taskDefinitionInfo.cpu,
      memoryLimitMiB: taskDefinitionInfo.memoryLimitMiB,
      executionRole: this.iamRole.ecsTaskExecutionRole,
      taskRole: this.iamRole.ecsTaskRole
    });

    for (const containerDefinitionInfo of taskDefinitionInfo.containerDefinitions) {
      const containerDefinition = taskDefinition.addContainer(containerDefinitionInfo.id, {
        containerName: containerDefinitionInfo.name,
        image: containerDefinitionInfo.image,
        entryPoint: containerDefinitionInfo.entryPoint,
        command: containerDefinitionInfo.command,
      });

      if (!!containerDefinitionInfo.port){
        containerDefinition.addPortMappings({
          containerPort: containerDefinitionInfo.port,
          hostPort: containerDefinitionInfo.port,
          protocol: Protocol.TCP
        });
      }
    }

    return taskDefinition;
  }
}