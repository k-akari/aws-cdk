import { Construct } from 'constructs';
import { CfnRole, ServicePrincipal, Effect, PolicyStatement, PolicyDocument, CfnInstanceProfile, OpenIdConnectProvider, FederatedPrincipal } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

export class IamRole extends Resource {
  constructor() {
    super();
  }

  public createEc2InstanceProfile(scope: Construct): CfnInstanceProfile {
    // Define a Policy Document
    const policyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('ec2.amazonaws.com')],
      actions: ['sts:AssumeRole']
    });

    // Create an Iam Role
    const iamRole = new CfnRole(scope, 'RoleEc2', {
      assumeRolePolicyDocument: new PolicyDocument({ statements: [policyStatement]}),
      managedPolicyArns: ['arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore'], // required to connect to SSM
      roleName: this.createResourceName(scope, 'role-ec2')
    });

    // Create an Instance Profile
    const instanceProfile = new CfnInstanceProfile(scope, 'InstanceProfile', {
      roles: [iamRole.ref],
      instanceProfileName: iamRole.roleName
    });

    return instanceProfile;
  }

  public createGithubRole(scope: Construct): CfnRole {
    // Create an OIDC Provider
    const oidcProvider = new OpenIdConnectProvider(scope, 'OIDCProvider', {
      url: 'https://vstoken.actions.githubusercontent.com',
      clientIds: ['sigstore'],
      thumbprints: ['a031c46782e6e6c662c2c87c76da9aa62ccabd8e']
    });

    // Create a Federated Principal
    const federatedPrincipal = new FederatedPrincipal(
      oidcProvider.openIdConnectProviderArn,
      {
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${scope.node.tryGetContext('repositoryName')}:*`,
        },
      }
    );

    // Define Policy Statements
    const policyStatements = [
      new PolicyStatement({ effect: Effect.ALLOW, principals: [federatedPrincipal], actions: ['sts:AssumeRoleWithWebIdentity'] }), 
      new PolicyStatement({ effect: Effect.ALLOW, resources: ['*'], actions: ['sts:GetCallerIdentity'] })
    ];

    // Create an Iam Role
    const iamRole = new CfnRole(scope, 'RoleGithub', {
      assumeRolePolicyDocument: new PolicyDocument({ statements: policyStatements}),
      roleName: this.createResourceName(scope, 'role-github')
    });

    return iamRole;
  }
}