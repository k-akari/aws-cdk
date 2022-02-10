import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from "aws-cdk-lib/aws-ec2";


export class NetworkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const envType = this.node.tryGetContext('envType');
    const serviceName = this.node.tryGetContext('serviceName');

    const vpc = new ec2.CfnVPC(this, 'Vpc', {
      cidrBlock: '10.0.0.0/16',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-vpc` },
             { key: 'Env', value: envType },
             { key: 'Service', value: serviceName }],
      enableDnsHostnames: true,
      enableDnsSupport: true
    });

    // Public Subnets
    const subnetPublic1a = new ec2.CfnSubnet(this, 'SubnetPublic1a', {
      cidrBlock: '10.0.10.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1a` }]
    })

    const subnetPublic1c = new ec2.CfnSubnet(this, 'SubnetPublic1c', {
      cidrBlock: '10.0.11.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1c` }]
    })

    const subnetPublic1d = new ec2.CfnSubnet(this, 'SubnetPublic1d', {
      cidrBlock: '10.0.12.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1d',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-public-1a` }]
    })

    // Private Subnets
    const subnetPrivate1a = new ec2.CfnSubnet(this, 'SubnetPrivate1a', {
      cidrBlock: '10.0.100.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1a` }]
    })

    const subnetPrivate1c = new ec2.CfnSubnet(this, 'SubnetPrivate1c', {
      cidrBlock: '10.0.101.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1c` }]
    })

    const subnetPrivate1d = new ec2.CfnSubnet(this, 'SubnetPrivate1d', {
      cidrBlock: '10.0.102.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1d',
      tags: [{ key: 'Name', value: `${serviceName}-${envType}-subnet-private-1d` }]
    })
  }
}
