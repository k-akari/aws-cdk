import { Construct } from 'constructs';
import { CfnRole, PolicyStatementProps, ServicePrincipal, Effect, PolicyStatement, PolicyDocument, CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
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
  public instanceProfile: CfnInstanceProfile

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

    this.instanceProfile = this.createInstanceProfile(scope, this.ec2);
  }

  private createRole(scope: Construct, iamRoleInfo: IamRoleInfo): CfnRole {
    const policyStatement = new PolicyStatement(iamRoleInfo.policyStatementProps);
    const policyDocument = new PolicyDocument({ statements: [policyStatement]});

    const role = new CfnRole(scope, iamRoleInfo.id, {
      assumeRolePolicyDocument: policyDocument,
      managedPolicyArns: iamRoleInfo.managedPolicyArns,
      roleName: this.createResourceName(scope, iamRoleInfo.roleName)
    });

    return role;
  }

  private createInstanceProfile(scope: Construct, iamRole: CfnRole): CfnInstanceProfile {
    const instanceProfile = new CfnInstanceProfile(scope, 'InstanceProfile', {
      roles: [iamRole.ref],
      instanceProfileName: iamRole.roleName
    });

    return instanceProfile;
  }
}