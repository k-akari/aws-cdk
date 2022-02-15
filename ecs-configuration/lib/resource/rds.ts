import { Construct } from 'constructs';
import { CfnDBSubnetGroup, CfnDBClusterParameterGroup, CfnDBParameterGroup, CfnDBCluster, CfnDBInstance } from 'aws-cdk-lib/aws-rds';
import { SecurityGroup } from '../resource/security-group';
import { Subnet } from '../resource/subnet';
import { SecretsManager, OSecretKey } from '../resource/secrets-manager';
import { Resource } from './abstract/resource';

interface InstanceInfo {
  readonly id: string;
  readonly availabilityZone: string;
  readonly preferredMaintenanceWindow: string;
  readonly resourceName: string;
  readonly assign: (instance: CfnDBInstance) => void;
}

export class Rds extends Resource {
  public cluster: CfnDBCluster;
  public instance1a: CfnDBInstance;
  public instance1c: CfnDBInstance;

  private static readonly engine = 'aurora-mysql';
  private static readonly databaseName = 'planning-poker';
  private static readonly dbInstanceClass = 'db.r5.large';
  private readonly subnet: Subnet;
  private readonly sg: SecurityGroup;
  private readonly ssm: SecretsManager;
  private readonly instances: InstanceInfo[] = [
    {
      id: 'RdsDbInstance1a',
      availabilityZone: 'ap-northeast-1a',
      preferredMaintenanceWindow: 'Mon:19:00-Mon:19:30',
      resourceName: 'rds-instance-1a',
      assign: instance => this.instance1a = instance
    },
    {
      id: 'RdsDbInstance1c',
      availabilityZone: 'ap-northeast-1c',
      preferredMaintenanceWindow: 'Mon:19:30-Mon:20:00',
      resourceName: 'rds-instance-1c',
      assign: instance => this.instance1c = instance
    }
  ];

  constructor(scope: Construct, subnet: Subnet, sg: SecurityGroup, ssm: SecretsManager) {
    super();

    this.subnet = subnet;
    this.sg = sg;
    this.ssm = ssm;

    const subnetGroup = this.createSubnetGroup(scope);
    const clusterParameterGroup = this.createClusterParameterGroup(scope);
    const parameterGroup = this.createParameterGroup(scope);
    this.cluster = this.createCluster(scope, subnetGroup, clusterParameterGroup);

    for (const instanceInfo of this.instances) {
      const instance = this.createInstance(scope, instanceInfo, this.cluster, subnetGroup, parameterGroup);
      instanceInfo.assign(instance);
  }
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

  private createCluster(scope: Construct, subnetGroup: CfnDBSubnetGroup, clusterParameterGroup: CfnDBClusterParameterGroup): CfnDBCluster {
    const cluster = new CfnDBCluster(scope, 'RdsDbCluster', {
      engine: 'aurora-mysql',
      backupRetentionPeriod: 35,
      databaseName: Rds.databaseName,
      dbClusterIdentifier: this.createResourceName(scope, 'rds-cluster'),
      dbClusterParameterGroupName: clusterParameterGroup.ref,
      dbSubnetGroupName: subnetGroup.ref,
      enableCloudwatchLogsExports: ['general', 'error', 'slowquery', 'audit'],
      engineMode: 'provisioned',
      engineVersion: '5.7.mysql_aurora.2.10.0',
      masterUserPassword: SecretsManager.getDynamicReference(this.ssm.rdsCluster, OSecretKey.MasterUserPassword),
      masterUsername: SecretsManager.getDynamicReference(this.ssm.rdsCluster, OSecretKey.MasterUsername),
      port: 3306,
      preferredBackupWindow: '18:00-19:00',
      preferredMaintenanceWindow: 'Mon:19:00-Mon:20:00',
      storageEncrypted: true,
      vpcSecurityGroupIds: [this.sg.rds.attrGroupId],
      tags: [{ key: 'Name', value: this.createResourceName(scope, 'rds-cluster') }]
    });

    return cluster;
  }

  private createInstance(scope: Construct, instanceInfo: InstanceInfo, cluster: CfnDBCluster, subnetGroup: CfnDBSubnetGroup, parameterGroup: CfnDBParameterGroup): CfnDBInstance {
    const instance = new CfnDBInstance(scope, instanceInfo.id, {
      dbInstanceClass: Rds.dbInstanceClass,
      autoMinorVersionUpgrade: false,
      availabilityZone: instanceInfo.availabilityZone,
      dbClusterIdentifier: cluster.ref,
      dbInstanceIdentifier: this.createResourceName(scope, instanceInfo.resourceName),
      dbParameterGroupName: parameterGroup.ref,
      dbSubnetGroupName: subnetGroup.ref,
      enablePerformanceInsights: true,
      engine: Rds.engine,
      monitoringInterval: 60,
      performanceInsightsRetentionPeriod: 7,
      preferredMaintenanceWindow: instanceInfo.preferredMaintenanceWindow,
      publiclyAccessible: false,
      tags: [{ key: 'Name', value: this.createResourceName(scope, instanceInfo.resourceName) }]
    });

    return instance;
  }
}