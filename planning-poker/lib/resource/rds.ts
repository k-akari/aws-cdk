import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { CfnDBSubnetGroup } from 'aws-cdk-lib/aws-rds';
import { Subnet } from '../resource/subnet';
import { Resource } from './abstract/resource';

export class Rds extends Resource {
  private readonly subnet: Subnet;

  constructor(scope: Construct, subnet: Subnet) {
    super();
    this.subnet = subnet;
    this.createSubnetGroup(scope);
  };

  private createSubnetGroup(scope: Construct): CfnDBSubnetGroup {
    const subnetGroup = new CfnDBSubnetGroup(scope, 'SubnetGroupRds', {
      dbSubnetGroupDescription: 'Subnet Group for RDS',
      subnetIds: [this.subnet.private1a.ref, this.subnet.private1c.ref],
      dbSubnetGroupName: this.createResourceName(scope, 'subnet-group-rds'),
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'subnet-group-rds') }],
    });

    return subnetGroup;
  }
}