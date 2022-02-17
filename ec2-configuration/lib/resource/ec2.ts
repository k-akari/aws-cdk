import { Construct } from 'constructs';
import { CfnInstance, CfnSubnet, CfnSecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

interface Ec2InstanceInfo {
  readonly id: string;
  readonly availabilityZone: string;
  readonly resourceName: string;
  readonly ami: string;
  readonly instanceType: string;
  readonly subnetId: () => string;
  readonly assign: (instance: CfnInstance) => void;
}

export class Ec2 extends Resource {
  public instance: CfnInstance;

  private static readonly latestImageIdAmazonLinux2 = 'ami-06631ebafb3ae5d34';
  private static readonly instanceType = 't2.micro';

  private readonly subnet: CfnSubnet;
  private readonly instanceProfile: CfnInstanceProfile;
  private readonly securityGroup: CfnSecurityGroup;
  private readonly ec2InstanceInfos: Ec2InstanceInfo[] = [
    {
      id: 'Ec2Instance1a',
      availabilityZone: 'ap-northeast-1a',
      resourceName: 'ec2-1a',
      ami: Ec2.latestImageIdAmazonLinux2,
      instanceType: Ec2.instanceType,
      subnetId: () => this.subnet.ref,
      assign: instance => this.instance = instance
    },
  ];

  constructor(scope: Construct, subnet: CfnSubnet, instanceProfile: CfnInstanceProfile, securityGroup: CfnSecurityGroup)
  {
    super();
    this.subnet = subnet;
    this.instanceProfile = instanceProfile;
    this.securityGroup = securityGroup;

    for (const ec2InstanceInfo of this.ec2InstanceInfos) {
      const instance = this.createInstance(scope, ec2InstanceInfo);
      ec2InstanceInfo.assign(instance);
    }
  };

  private createInstance(scope: Construct, ec2InstanceInfo: Ec2InstanceInfo): CfnInstance {
    const instance = new CfnInstance(scope, ec2InstanceInfo.id, {
      availabilityZone: ec2InstanceInfo.availabilityZone,
      iamInstanceProfile: this.instanceProfile.ref,
      imageId: ec2InstanceInfo.ami,
      instanceType: ec2InstanceInfo.instanceType,
      securityGroupIds: [this.securityGroup.attrGroupId],
      subnetId: ec2InstanceInfo.subnetId(),
      tags: [{
        key: 'Name', value: this.createResourceName(scope, ec2InstanceInfo.resourceName)
      }]
    });

    return instance;
  }
}