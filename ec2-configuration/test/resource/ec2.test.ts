import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as Network from '../../lib/stack/network-stack';
import * as Iam from '../../lib/stack/iam-stack';
import * as Server from '../../lib/stack/server-stack';

test('Ec2', () => {
  const serviceName = 'service';
  const envType = 'test';
  const app = new App({
    context: {
      'serviceName': serviceName,
      'envType': envType
    }
  });
  
  const networkStack = new Network.NetworkStack(app, 'NetworkStack');
  const iamStack = new Iam.IamStack(app, 'IamStack');
  const securityGroupStack = new SecurityGroup.SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
  const serverStack = new Server.ServerStack(app, 'ServerStack', networkStack.subnet.public1a, iamStack.iamRole.instanceProfile, securityGroupStack.sg.ec2);
  const template = Template.fromStack(serverStack);

  template.resourceCountIs('AWS::EC2::Instance', 1);
  template.hasResourceProperties('AWS::EC2::Instance', {
    AvailabilityZone: 'ap-northeast-1a',
    IamInstanceProfile: { 'Fn::ImportValue': Match.anyValue() },
    ImageId: 'ami-08a8688fb7eacb171',
    InstanceType: 't3.small',
    SecurityGroupIds: [{ 'Fn::ImportValue': Match.anyValue() }],
    SubnetId: { 'Fn::ImportValue': Match.anyValue() },
    Tags: [{ 'Key': 'Name', 'Value': `${serviceName}-${envType}-ec2-1a` }]
  });
});