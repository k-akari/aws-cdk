#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/stack/network-stack';
import { ServerStack } from '../lib/stack/server-stack';
import { GithubActionsStack } from '../lib/stack/github-actions-stack';

const app = new cdk.App();

const networkStack = new NetworkStack(app, 'NetworkStack');
new ServerStack(app, 'ServerStack', networkStack.vpc, networkStack.subnet);
new GithubActionsStack(app, 'GithubActionsStack');