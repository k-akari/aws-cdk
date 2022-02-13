import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Subnet } from '../resource/subnet';
import { Rds } from '../resource/rds';

export class DatabaseStack extends Stack {
  constructor(scope: Construct, id: string, subnet: Subnet, props?: StackProps) {
    super(scope, id, props);
   
    new Rds(this, subnet);
  }
}
