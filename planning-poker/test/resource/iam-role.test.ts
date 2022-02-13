import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import * as Iam from '../../lib/stack/iam-stack';

test('ElasticIp', () => {
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

  template.resourceCountIs('AWS::IAM::Role', 3);
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [{
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: 'ecs-tasks.amazonaws.com'
        }
      }],
      Version: Match.anyValue()
    },
    ManagedPolicyArns: [
      'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      'arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy',
      'arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess'
    ],
    RoleName: `${serviceName}-${envType}-ecs-task-execution-role`
  });
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [{
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: Match.arrayWith(['ecs-tasks.amazonaws.com', 'events.amazonaws.com'])
        }
      }],
      Version: Match.anyValue()
    },
    ManagedPolicyArns: [
      'arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceEventsRole'
    ],
    RoleName: `${serviceName}-${envType}-ecs-task-role`
  });
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [{
        Action: 'sts:AssumeRole',
        Effect: 'Allow',
        Principal: {
          Service: 'application-autoscaling.amazonaws.com'
        }
      }],
      Version: Match.anyValue()
    },
    RoleName: `${serviceName}-${envType}-ecs-service-auto-scaling-role`
  });
});
