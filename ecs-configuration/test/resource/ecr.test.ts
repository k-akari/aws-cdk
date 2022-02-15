import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as Iam from '../../lib/stack/iam-stack';
import * as Container from '../../lib/stack/container-stack';

test('Ecr', () => {
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
