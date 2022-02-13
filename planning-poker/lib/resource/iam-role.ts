import { Construct } from 'constructs';
import { CfnRole, PolicyDocument, PolicyStatement, PolicyStatementProps, Effect, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

interface ResourceInfo {
  readonly id: string;
  readonly policyStatementProps: PolicyStatementProps;
  readonly managedPolicyArns?: string[];
  readonly roleName: string;
  readonly assign: (role: CfnRole) => void;
}

export class IamRole extends Resource {
  public ecsTaskExecutionRole: CfnRole;
  public ecsTaskRole: CfnRole;
  public ecsServiceAutoScalingRole: CfnRole;

  private readonly resources: ResourceInfo[] = [
    {
      id: 'EcsTaskExecutionRole',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('ecs-tasks.amazonaws.com')],
        actions: ['sts:AssumeRole']
      },
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
        'arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy',
        'arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess'
      ],
      roleName: 'ecs-task-execution-role',
      assign: role => this.ecsTaskExecutionRole = role
    },
    {
      id: 'EcsTaskRole',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('ecs-tasks.amazonaws.com'), new ServicePrincipal('events.amazonaws.com')],
        actions: ['sts:AssumeRole']
      },
      managedPolicyArns: [
        'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole'
      ],
      roleName: 'ecs-task-role',
      assign: role => this.ecsTaskRole = role
    },
    {
      id: 'EcsServiceAutoScalingRole',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('application-autoscaling.amazonaws.com')],
        actions: ['sts:AssumeRole']
      },
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

  private createRole(scope: Construct, resourceInfo: ResourceInfo): CfnRole {
    const policyStatement = new PolicyStatement(resourceInfo.policyStatementProps);

    const policyDocument = new PolicyDocument({
        statements: [policyStatement]
    });

    const role = new CfnRole(scope, resourceInfo.id, {
      assumeRolePolicyDocument: policyDocument,
      managedPolicyArns: resourceInfo.managedPolicyArns,
      roleName: this.createResourceName(scope, resourceInfo.roleName)
    });

    return role;
  }
}