import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecretsManager } from '../resource/secrets-manager';

export class SecretsManagerStack extends Stack {
  public readonly ssm: SecretsManager

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    this.ssm = new SecretsManager(this);
  }
}
