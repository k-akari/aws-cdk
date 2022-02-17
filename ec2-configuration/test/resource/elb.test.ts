import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as Network from '../../lib/stack/network-stack';
import * as SecurityGroup from '../../lib/stack/security-group-stack';
import * as Iam from '../../lib/stack/iam-stack';
import * as Server from '../../lib/stack/server-stack';
import * as LoadBalancer from '../../lib/stack/load-balancer-stack';

test('SecurityGroup', () => {
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
  const iamStack = new Iam.IamStack(app, 'IamStack');
  const serverStack = new Server.ServerStack(app, 'ServerStack', networkStack.subnet.private1a, iamStack.iamRole.instanceProfile, securityGroupStack.sg.ec2);
  const loadBalancerStack = new LoadBalancer.LoadBalancerStack(app, 'LoadBalancerStack', networkStack.vpc, networkStack.subnet.private1a, securityGroupStack.sg.ec2, serverStack.ec2.mainInstance);
  const template = Template.fromStack(loadBalancerStack);

  template.resourceCountIs('AWS::ElasticLoadBalancingV2::LoadBalancer', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    IpAddressType: 'ipv4',
    Name: `${serviceName}-${envType}-alb`,
    Scheme: 'internet-facing',
    SecurityGroups: Match.anyValue(),
    Subnets: Match.anyValue(),
    Type: 'application'
  });

  template.resourceCountIs('AWS::ElasticLoadBalancingV2::TargetGroup', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
    Name: `${serviceName}-${envType}-tg`,
    Port: 80,
    Protocol: 'HTTP',
    Targets: Match.anyValue(),
    TargetType: 'instance',
    VpcId: { 'Fn::ImportValue': Match.anyValue() },
  });

  template.resourceCountIs('AWS::ElasticLoadBalancingV2::Listener', 1);
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::Listener', {
    DefaultActions: [{
      Type: 'forward',
      ForwardConfig: {
        TargetGroups: [{
          TargetGroupArn: Match.anyValue(),
          Weight: 1
        }]
      }
    }],
    LoadBalancerArn: Match.anyValue(),
    Port: 80,
    Protocol: 'HTTP'
  });
});
