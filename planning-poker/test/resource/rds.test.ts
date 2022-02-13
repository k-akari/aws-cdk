import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
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
  const databaseStack = new Database.DatabaseStack(app, 'DatabaseStack', networkStack.subnet);
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
});
