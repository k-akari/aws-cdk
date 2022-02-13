import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Subnet } from '../resource/subnet';
import { Rds } from '../resource/rds';
import { SecurityGroup } from '../resource/security-group';
import { SecretsManager } from '../resource/secrets-manager';

export class DatabaseStack extends Stack {
  constructor(scope: Construct, id: string, subnet: Subnet, sg: SecurityGroup, ssm: SecretsManager, props?: StackProps) {
    super(scope, id, props);
   
    new Rds(this, subnet, sg, ssm);
  }
}
