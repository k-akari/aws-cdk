import { Construct } from 'constructs';
import { CfnPolicy, PolicyStatementProps, Effect } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

interface ResourceInfo {
  readonly id: string;
  readonly policyStatementProps: PolicyStatementProps[];
  readonly policyName: string;
  readonly assign: (policy: CfnPolicy) => void;
}

export class IamPolicy extends Resource {
  public ecsTaskRolePolicy: CfnPolicy;
  public ecsServiceAutoScalingRolePolicy: CfnPolicy;

  private readonly resources: ResourceInfo[] = [
    {
      id: 'EcsTaskRolePolicy',
      policyStatementProps: [
        {
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: ['s3:List*', 's3:Get*', 's3:Put*', 's3:DeleteObject']
        },
        {
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: [
            'sqs:DeleteMessage', 'sqs:GetQueueUrl', 'sqs:ChangeMessageVisibility', 'sqs:SendMessageBatch',
            'sqs:ReceiveMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes', 'sqs:ListQueueTags',
            'sqs:ListDeadLetterSourceQueues', 'sqs:DeleteMessageBatch', 'sqs:PurgeQueue', 'sqs:DeleteQueue',
            'sqs:CreateQueue', 'sqs:ChangeMessageVisibilityBatch', 'sqs:SetQueueAttributes'
          ]
        }
      ],
      policyName: 'ecs-task-role-policy',
      assign: policy => this.ecsTaskRolePolicy = policy
    },
    {
      id: 'EcsServiceAutoScalingRolePolicy',
      policyStatementProps: [
        {
          effect: Effect.ALLOW,
          resources: ['*'],
          actions: [
            'application-autoscaling:*', 'cloudwatch:DescribeAlarms', 'cloudwatch:PutMetricAlarm',
            'ecs:DescribeServices', 'ecs:UpdateService'
          ]
        }
      ],
      policyName: 'ecs-service-auto-scaling-role-policy',
      assign: policy => this.ecsServiceAutoScalingRolePolicy = policy
    },
  ];

  constructor(scope: Construct) {
    super();

    for (const resourceInfo of this.resources) {
      const policy = this.createPolicy(scope, resourceInfo);
      resourceInfo.assign(policy);
    }
  }

  private createPolicy(scope: Construct, resourceInfo: ResourceInfo): CfnPolicy {
    const policy = new CfnPolicy(scope, resourceInfo.id, {
      policyDocument: resourceInfo.policyStatementProps,
      policyName: this.createResourceName(scope, resourceInfo.policyName)
    });

    return policy;
  }
}