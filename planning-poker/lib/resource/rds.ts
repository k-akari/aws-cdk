import { Construct } from 'constructs';
import { CfnDBSubnetGroup, CfnDBClusterParameterGroup, CfnDBParameterGroup } from 'aws-cdk-lib/aws-rds';
import { Subnet } from '../resource/subnet';
import { Resource } from './abstract/resource';

export class Rds extends Resource {
  private readonly subnet: Subnet;

  constructor(scope: Construct, subnet: Subnet) {
    super();

    this.subnet = subnet;

    this.createSubnetGroup(scope);
    this.createClusterParameterGroup(scope);
    this.createParameterGroup(scope);
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

  private createClusterParameterGroup(scope: Construct): CfnDBClusterParameterGroup {
    const clusterParameterGroup = new CfnDBClusterParameterGroup(scope, 'DbClusterParameterGroup', {
      description: 'Cluster Parameter Group for RDS',
      family: 'aurora-mysql5.7',
      parameters: {
        character_set_server: 'utf8mb4',
        collation_server: 'utf8mb4_unicode_ci',
        long_query_time: 1,
        server_audit_logging: 1,
        slow_query_log: 1,
        time_zone: 'Asia/Tokyo'
      }
    });

    return clusterParameterGroup;
  }

  private createParameterGroup(scope: Construct): CfnDBParameterGroup {
    const parameterGroup = new CfnDBParameterGroup(scope, 'ParameterGroupRds', {
      description: 'Parameter Group for RDS',
      family: 'aurora-mysql5.7'
    });

    return parameterGroup;
  }
}