import { Construct } from 'constructs';
import { CfnInstance, CfnSubnet, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

export class Ec2 extends Resource {
  constructor() {
    super();
  }

  public createEc2Instance(scope: Construct, subnet: CfnSubnet, instanceProfile: CfnInstanceProfile, securityGroup: CfnSecurityGroup): CfnInstance {
    const instance = new CfnInstance(scope, 'Ec2Instance1a', {
      availabilityZone: 'ap-northeast-1a',
      iamInstanceProfile: instanceProfile.ref,
      imageId: 'ami-08a8688fb7eacb171', // Latest Amazon Linux 2
      instanceType: 't3.small',
      securityGroupIds: [securityGroup.attrGroupId],
      subnetId: subnet.ref,
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'ec2-1a') }]
    });

    return instance;
  }
}