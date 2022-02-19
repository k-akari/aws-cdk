#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stack/network-stack';
import { IamStack } from '../lib/stack/iam-stack';
import { SecurityGroupStack } from '../lib/stack/security-group-stack';
import { ServerStack } from '../lib/stack/server-stack';
import { LoadBalancerStack } from '../lib/stack/load-balancer-stack';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'NetworkStack');
const iamStack = new IamStack(app, 'IamStack');
const securityGroupStack = new SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);
const serverStack = new ServerStack(app, 'ServerStack', networkStack.subnet.public1a, iamStack.iamRole.instanceProfile, securityGroupStack.sg.ec2);
new LoadBalancerStack(app, 'LoadBalancerStack', networkStack.vpc, networkStack.subnet, securityGroupStack.sg.ec2, serverStack.ec2.mainInstance);