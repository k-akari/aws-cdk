import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as Iam from '../../lib/stack/iam-stack';
import * as Container from '../../lib/stack/container-stack';

test('Ecs', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const iamStack = new Iam.IamStack(app, 'IamStack');
  const containerStack = new Container.ContainerStack(app, 'ContainerStack', networkStack.vpc, iamStack.iamRole);
  const template = Template.fromStack(containerStack);

  template.resourceCountIs('AWS::ECS::Cluster', 1);
  template.hasResourceProperties('AWS::ECS::Cluster', {
    ClusterName: `${serviceName}-${envType}-ecs-cluster`,
    ClusterSettings: Match.arrayWith([
      { Name: 'containerInsights', Value: 'enabled' }
    ])
  });

  template.resourceCountIs('AWS::ECS::TaskDefinition', 2);
  template.hasResourceProperties('AWS::ECS::TaskDefinition', {
    Family: `${serviceName}-${envType}-service`,
    Cpu: '256',
    Memory: '2048',
    NetworkMode: 'awsvpc',
    RequiresCompatibilities: Match.arrayWith(['FARGATE']),
    TaskRoleArn: { 'Fn::ImportValue': Match.anyValue() },
    ExecutionRoleArn: { 'Fn::ImportValue': Match.anyValue() }
  });
  template.hasResourceProperties('AWS::ECS::TaskDefinition', {
    Family: `${serviceName}-${envType}-migration`,
    Cpu: '256',
    Memory: '2048',
    NetworkMode: 'awsvpc',
    RequiresCompatibilities: Match.arrayWith(['FARGATE']),
    TaskRoleArn: { 'Fn::ImportValue': Match.anyValue() },
    ExecutionRoleArn: { 'Fn::ImportValue': Match.anyValue() }
  });
});
