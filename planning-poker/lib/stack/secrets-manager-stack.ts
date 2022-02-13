import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SecretsManager } from '../resource/secrets-manager';

export class SecretsManagerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    new SecretsManager(this);
  }
}
