import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Iam from '../../lib/stack/iam-stack';

test('IamPolicy', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new Iam.IamStack(app, 'IamStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::IAM::Policy', 2);
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: [
      {
        effect: 'Allow',
        resources: Match.arrayWith(['*']),
        actions: Match.arrayWith(['s3:List*', 's3:Get*', 's3:Put*', 's3:DeleteObject'])
      },
      {
        effect: 'Allow',
        resources: Match.arrayWith(['*']),
        actions: Match.arrayWith([
          'sqs:DeleteMessage', 'sqs:GetQueueUrl', 'sqs:ChangeMessageVisibility', 'sqs:SendMessageBatch',
          'sqs:ReceiveMessage', 'sqs:SendMessage', 'sqs:GetQueueAttributes', 'sqs:ListQueueTags',
          'sqs:ListDeadLetterSourceQueues', 'sqs:DeleteMessageBatch', 'sqs:PurgeQueue', 'sqs:DeleteQueue',
          'sqs:CreateQueue', 'sqs:ChangeMessageVisibilityBatch', 'sqs:SetQueueAttributes'
        ])
      }
    ],
    PolicyName: `${serviceName}-${envType}-ecs-task-role-policy`
  });
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: [
      {
        effect: 'Allow',
        resources: Match.arrayWith(['*']),
        actions: Match.arrayWith([
          'application-autoscaling:*', 'cloudwatch:DescribeAlarms', 'cloudwatch:PutMetricAlarm',
          'ecs:DescribeServices', 'ecs:UpdateService'
        ])
      }
    ],
    PolicyName: `${serviceName}-${envType}-ecs-service-auto-scaling-role-policy`
  });
});
