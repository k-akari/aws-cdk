import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as Iam from '../../lib/stack/iam-stack';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as Server from '../../lib/stack/server-stack';
import * as LoadBalancer from '../../lib/stack/load-balancer-stack';

test('ServerStackSnapshot', () => {
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
  const securityGroupStack = new SecurityGroup.SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
  const serverStack = new Server.ServerStack(app, 'ServerStack', networkStack.subnet.public1a, iamStack.iamRole.instanceProfile, securityGroupStack.sg.ec2);
  const loadBalancerStack = new LoadBalancer.LoadBalancerStack(app, 'LoadBalancerStack', networkStack.vpc, networkStack.subnet, securityGroupStack.sg.ec2, serverStack.ec2.mainInstance);
  const template = Template.fromStack(loadBalancerStack);

  expect(template).toMatchSnapshot();
});
