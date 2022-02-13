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
});
