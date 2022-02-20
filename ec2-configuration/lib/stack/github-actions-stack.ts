import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IamRole } from '../resource/iam-role';
import { OIDCProvider } from '../resource/open-id-connect-provider';

export class GithubActionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    const oidcProvider = new OIDCProvider(this);
    new IamRole().createGithubRole(this, oidcProvider.github);
  }
}
