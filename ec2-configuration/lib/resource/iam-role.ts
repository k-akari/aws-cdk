import { Construct } from 'constructs';
import { CfnRole, PolicyStatementProps, ServicePrincipal, Effect, PolicyStatement, PolicyDocument } from 'aws-cdk-lib/aws-iam';
import { Resource } from './abstract/resource';

interface IamRoleInfo {
  readonly id: string;
  readonly policyStatementProps: PolicyStatementProps;
  readonly managedPolicyArns: string[];
  readonly roleName: string;
  readonly assign: (role: CfnRole) => void;
}

export class IamRole extends Resource {
  public ec2: CfnRole;

  private readonly roleInfos: IamRoleInfo[] = [
    {
      id: 'RoleEc2',
      policyStatementProps: {
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal('ec2.amazonaws.com')],
        actions: ['sts:AssumeRole']
      },
      managedPolicyArns: [],
      roleName: 'role-ec2',
      assign: role => this.ec2 = role
    },
  ];

  constructor(scope: Construct) {
    super();

    for (const roleInfo of this.roleInfos) {
      const role = this.createRole(scope, roleInfo);
      roleInfo.assign(role);
    }
  }

  private createRole(scope: Construct, resourceInfo: IamRoleInfo): CfnRole {
    const policyStatement = new PolicyStatement(resourceInfo.policyStatementProps);
    const policyDocument = new PolicyDocument({ statements: [policyStatement]});

    const role = new CfnRole(scope, resourceInfo.id, {
      assumeRolePolicyDocument: policyDocument,
      managedPolicyArns: resourceInfo.managedPolicyArns,
      roleName: this.createResourceName(scope, resourceInfo.roleName)
    });

    return role;
  }
}