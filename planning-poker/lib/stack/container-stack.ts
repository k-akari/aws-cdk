import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { IamRole } from '../resource/iam-role';
import { Ecr } from '../resource/ecr';
import { Ecs } from '../resource/ecs';

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, vpc: Vpc, iamRole: IamRole, props?: StackProps) {
    super(scope, id, props);
   
    new Ecr(this);
    new Ecs(this, vpc, iamRole);
  }
}
