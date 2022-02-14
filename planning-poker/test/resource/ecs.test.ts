import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
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
  const containerStack = new Container.ContainerStack(app, 'ContainerStack', networkStack.vpc);
  const template = Template.fromStack(containerStack);

  template.resourceCountIs('AWS::ECS::Cluster', 1);
  template.hasResourceProperties('AWS::ECS::Cluster', {
    ClusterName: `${serviceName}-${envType}-ecs-cluster`,
    ClusterSettings: Match.arrayWith([
      { Name: 'containerInsights', Value: 'enabled' }
    ])
  });
});
