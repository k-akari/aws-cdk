import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as Container from '../../lib/stack/container-stack';

test('NetworkStackSnapshot', () => {
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

  expect(template).toMatchSnapshot();
});
