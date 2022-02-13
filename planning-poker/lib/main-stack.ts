import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkStack } from './stack/network-stack';
import { SecurityGroupStack } from './stack/security-group-stack';
import { EcrStack } from './stack/ecr-stack';
import { DatabaseStack } from './stack/database-stack';
import { SecretsManagerStack } from './stack/secrets-manager-stack';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, 'NetworkStack', {
      stackName: 'network-stack'
    });

    new SecurityGroupStack(scope, 'SecurityGroupStack', networkStack.vpc, {
      stackName: 'security-group-stack'
    });

    new EcrStack(scope, 'EcrStack', {
      stackName: 'ecr-stack'
    });

    new SecretsManagerStack(scope, 'SecretsManagerStack', {
      stackName: 'secrets-manager-stack'
    })

    new DatabaseStack(scope, 'DatabaseStack', networkStack.subnet, {
      stackName: 'database-stack'
    })
  }
}
