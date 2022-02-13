import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as SecretsManager from '../../lib/stack/secrets-manager-stack';

test('Rds', () => {
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

  template.resourceCountIs('AWS::SecretsManager::Secret', 1);
  template.hasResourceProperties('AWS::SecretsManager::Secret', {
    Description: 'for RDS cluster',
    GenerateSecretString: {
      ExcludeCharacters: '"@/\\\'',
      GenerateStringKey: 'MasterUserPassword',
      PasswordLength: 16,
      SecretStringTemplate: '{"MasterUsername": "admin"}'
    },
  Name: `${serviceName}-${envType}-secrets-rds-cluster`
  });
});
