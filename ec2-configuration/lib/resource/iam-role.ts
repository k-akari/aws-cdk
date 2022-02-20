import { Construct } from 'constructs';
import { CfnRole, Role, ServicePrincipal, Effect, PolicyStatement, PolicyDocument,
         CfnInstanceProfile, OpenIdConnectProvider, FederatedPrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
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

  public createGithubRole(scope: Construct, oidcProvider: OpenIdConnectProvider): void {
    // Create a Federated Principal
    const githubPrincipal = new FederatedPrincipal(
      oidcProvider.openIdConnectProviderArn,
      {
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${scope.node.tryGetContext('githubOrgName')}/${scope.node.tryGetContext('githubRepoName')}:*`,
        },
        StringEquals : {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
        },
      },
      'sts:AssumeRoleWithWebIdentity'
    );

    // Create an Iam Role
    const githubRole = new Role(scope, 'RoleGithub', {
      assumedBy: githubPrincipal,
      path: '/',
      roleName: this.createResourceName(scope, 'role-github'),
      description: 'Role assumed by githubPrincipal for deploying from CI using aws cdk',
      inlinePolicies: {
        AssumeRolePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({ effect: Effect.ALLOW, resources: ['*'], actions: ['sts:GetCallerIdentity'] })
          ]
        })
      }
    });

    // Policy for Opening and Closing EC2 Ports
    const securityGroupEditablePolicy = new ManagedPolicy(scope, 'trigger-code-pipeline', {
      managedPolicyName: 'trigger-codepipeline',
      document: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            resources: ['*'],
            actions: ['ec2:AuthorizeSecurityGroupEgress', 'ec2:AuthorizeSecurityGroupIngress',
                      'ec2:RevokeSecurityGroupEgress', 'ec2:RevokeSecurityGroupIngress']
          })
        ]
      })
    });

    securityGroupEditablePolicy.attachToRole(githubRole);
  }
}