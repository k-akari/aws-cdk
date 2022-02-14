import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
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
  const stack = new Container.ContainerStack(app, 'ContainerStack');
  const template = Template.fromStack(stack);

  expect(template).toMatchSnapshot();
});
