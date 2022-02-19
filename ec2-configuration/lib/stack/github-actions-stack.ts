import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IamRole } from '../resource/iam-role';

export class GithubActionsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    new IamRole().createGithubRole(this);
  }
}
