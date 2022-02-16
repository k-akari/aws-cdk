import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IamRole } from '../resource/iam-role';

export class IamStack extends Stack {
  public readonly iamRole: IamRole;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    this.iamRole = new IamRole(this);
  }
}
