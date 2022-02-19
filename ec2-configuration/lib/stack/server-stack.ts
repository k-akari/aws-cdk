import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Ec2 } from '../resource/ec2';
import { Subnet } from '../resource/subnet';
import { SecurityGroup } from '../resource/security-group';
import { IamRole } from '../resource/iam-role';
import { ElasticIp } from '../resource/elastic-ip';
import { Elb } from '../resource/elb';

export class ServerStack extends Stack {
  constructor(scope: Construct, id: string, vpc: Vpc, subnet: Subnet, props?: StackProps) {
    super(scope, id, props);

    const sg = new SecurityGroup(this, vpc);

    const instanceProfile = new IamRole().createEc2InstanceProfile(this);
    const ec2Instance = new Ec2().createEc2Instance(this, subnet.public1a, instanceProfile, sg.ec2);
    new ElasticIp().associateElasticIp(this, ec2Instance, 'ec2-1a');

    new Elb(this, vpc, [subnet.public1a, subnet.public1c], sg.alb, ec2Instance);
  }
}
