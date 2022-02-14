import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Ecr } from '../resource/ecr';

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    new Ecr(this);
  }
}
