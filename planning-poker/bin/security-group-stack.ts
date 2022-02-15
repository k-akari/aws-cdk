#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stack/network-stack';
import { SecurityGroupStack } from '../lib/stack/security-group-stack';

const app = new cdk.App();
const networkStack = new NetworkStack(app, 'NetworkStack', {});
new SecurityGroupStack(app, 'SecurityGroupStack', networkStack.vpc);