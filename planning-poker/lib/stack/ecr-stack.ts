import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Ecr } from '../resource/ecr';

export class EcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
   
    new Ecr(this);
  }
}
