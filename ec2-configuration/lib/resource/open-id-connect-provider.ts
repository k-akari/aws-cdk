import { Construct } from 'constructs';
import { OpenIdConnectProvider } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

export class OIDCProvider extends Resource {
  public github: OpenIdConnectProvider;

  constructor(scope: Construct) {
    super();

    this.github = new OpenIdConnectProvider(scope, 'OIDCProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
      thumbprints: ['a031c46782e6e6c662c2c87c76da9aa62ccabd8e', '6938fd4d98bab03faadb97b34396831e3780aea1']
    });
  }
}