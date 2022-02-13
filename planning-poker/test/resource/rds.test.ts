import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as SecretsManager from '../../lib/stack/secrets-manager-stack';
import * as Database from '../../lib/stack/database-stack';

test('Rds', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const securityGroupStack = new SecurityGroup.SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
  const secretsManagerStack = new SecretsManager.SecretsManagerStack(app, 'SecretsManagerStack');
  const databaseStack = new Database.DatabaseStack(app, 'DatabaseStack', networkStack.subnet, securityGroupStack.sg, secretsManagerStack.ssm);
  const template = Template.fromStack(databaseStack);

  template.resourceCountIs('AWS::RDS::DBSubnetGroup', 1);
  template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
    DBSubnetGroupDescription: 'Subnet Group for RDS',
    SubnetIds: Match.anyValue(),
    DBSubnetGroupName: `${serviceName}-${envType}-subnet-group-rds`,
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-subnet-group-rds` }]
  });

  template.resourceCountIs('AWS::RDS::DBClusterParameterGroup', 1);
  template.hasResourceProperties('AWS::RDS::DBClusterParameterGroup', {
    Description: 'Cluster Parameter Group for RDS',
    Family: 'aurora-mysql5.7',
    Parameters: {
      character_set_server: 'utf8mb4',
      collation_server: 'utf8mb4_unicode_ci',
      long_query_time: 1,
      server_audit_logging: 1,
      slow_query_log: 1,
      time_zone: 'Asia/Tokyo'
    }
  });

  template.resourceCountIs('AWS::RDS::DBParameterGroup', 1);
  template.hasResourceProperties('AWS::RDS::DBParameterGroup', {
    Description: 'Parameter Group for RDS',
    Family: 'aurora-mysql5.7'
  });

  template.resourceCountIs('AWS::RDS::DBCluster', 1);
  template.hasResourceProperties('AWS::RDS::DBCluster', {
    Engine: 'aurora-mysql',
    BackupRetentionPeriod: 35,
    DatabaseName: 'planning-poker',
    DBClusterIdentifier: `${serviceName}-${envType}-rds-cluster`,
    DBClusterParameterGroupName: Match.anyValue(),
    DBSubnetGroupName: Match.anyValue(),
    EnableCloudwatchLogsExports: ['general', 'error', 'slowquery', 'audit'],
    EngineMode: 'provisioned',
    EngineVersion: '5.7.mysql_aurora.2.10.0',
    MasterUsername: Match.anyValue(),
    MasterUserPassword: Match.anyValue(),
    Port: 3306,
    PreferredBackupWindow: '18:00-19:00',
    PreferredMaintenanceWindow: 'Mon:19:00-Mon:20:00',
    StorageEncrypted: true,
    VpcSecurityGroupIds: Match.anyValue(),
    Tags: Match.arrayWith([{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-rds-cluster` }])
  });
});
