import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as SecretsManager from '../../lib/stack/secrets-manager-stack';

test('SecretsManagerStackSnapshot', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new SecretsManager.SecretsManagerStack(app, 'SecretsManagerStack');
  const template = Template.fromStack(stack);

  expect(template).toMatchSnapshot();
});
