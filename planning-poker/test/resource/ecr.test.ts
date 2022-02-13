import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Ecr from '../../lib/stack/ecr-stack';

test('ElasticIp', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const stack = new Ecr.EcrStack(app, 'EcrStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::ECR::Repository', 2);
  template.hasResourceProperties('AWS::ECR::Repository', {
    RepositoryName: `${serviceName}-${envType}-app`,
    ImageTagMutability: 'IMMUTABLE'
  });
  template.hasResourceProperties('AWS::ECR::Repository', {
    RepositoryName: `${serviceName}-${envType}-web`,
    ImageTagMutability: 'IMMUTABLE'
  });
});
