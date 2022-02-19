import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NetworkStack } from './stack/network-stack';
import { ServerStack } from './stack/server-stack';
import { GithubActionsStack } from './stack/github-actions-stack';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const networkStack = new NetworkStack(scope, 'NetworkStack', {
      stackName: 'network-stack'
    });

    new ServerStack(scope, 'ServerStack', networkStack.vpc, networkStack.subnet, {
      stackName: 'server-stack'
    });

    new GithubActionsStack(scope, 'GithubActionsStack', {
      stackName: 'github-actions-stack'
    });
  }
}
