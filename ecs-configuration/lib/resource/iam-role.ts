import { Construct } from 'constructs';
import { Role, IManagedPolicy, ServicePrincipal, ManagedPolicy, CompositePrincipal } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

interface ResourceInfo {
  readonly id: string;
  readonly iamPrincipals: CompositePrincipal;
  readonly managedPolicies?: IManagedPolicy[];
  readonly roleName: string;
  readonly assign: (role: Role) => void;
}

export class IamRole extends Resource {
  public ecsTaskExecutionRole: Role;
  public ecsTaskRole: Role;
  public ecsServiceAutoScalingRole: Role;

  private readonly resources: ResourceInfo[] = [
    {
      id: 'EcsTaskExecutionRole',
      iamPrincipals: new CompositePrincipal(new ServicePrincipal('ecs-tasks.amazonaws.com')),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
        ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
        ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
      ],
      roleName: 'ecs-task-execution-role',
      assign: role => this.ecsTaskExecutionRole = role
    },
    {
      id: 'EcsTaskRole',
      iamPrincipals: new CompositePrincipal(new ServicePrincipal('ecs-tasks.amazonaws.com'), new ServicePrincipal('events.amazonaws.com')),
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceEventsRole')],
      roleName: 'ecs-task-role',
      assign: role => this.ecsTaskRole = role
    },
    {
      id: 'EcsServiceAutoScalingRole',
      iamPrincipals: new CompositePrincipal(new ServicePrincipal('application-autoscaling.amazonaws.com')),
      roleName: 'ecs-service-auto-scaling-role',
      assign: role => this.ecsServiceAutoScalingRole = role
    },
  ];

  constructor(scope: Construct) {
    super();

    for (const resourceInfo of this.resources) {
      const role = this.createRole(scope, resourceInfo);
      resourceInfo.assign(role);
    }
  }

  private createRole(scope: Construct, resourceInfo: ResourceInfo): Role {
    const role = new Role(scope, resourceInfo.id, {
      assumedBy: resourceInfo.iamPrincipals,
      managedPolicies: resourceInfo.managedPolicies,
      roleName: this.createResourceName(scope, resourceInfo.roleName)
    });

    return role;
  }
}