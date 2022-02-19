import { Construct } from 'constructs';
import { CfnInstance, CfnSubnet, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

export class Ec2 extends Resource {
  public mainInstance: CfnInstance;

  private readonly subnet: CfnSubnet;
  private readonly instanceProfile: CfnInstanceProfile;
  private readonly securityGroup: CfnSecurityGroup;

  constructor(scope: Construct, subnet: CfnSubnet, instanceProfile: CfnInstanceProfile, securityGroup: CfnSecurityGroup)
  {
    super();

    this.subnet = subnet;
    this.instanceProfile = instanceProfile;
    this.securityGroup = securityGroup;

    // Create a EC2 Instance
    this.mainInstance = new CfnInstance(scope, 'Ec2Instance1a', {
      availabilityZone: 'ap-northeast-1a',
      iamInstanceProfile: this.instanceProfile.ref,
      imageId: 'ami-08a8688fb7eacb171', // Latest Amazon Linux 2
      instanceType: 't3.small',
      securityGroupIds: [this.securityGroup.attrGroupId],
      subnetId: this.subnet.ref,
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'ec2-1a') }]
    });
  };
}