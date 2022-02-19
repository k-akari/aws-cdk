import { Construct } from 'constructs';
import { CfnEIP, CfnInstance, CfnEIPAssociation } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

export class ElasticIp extends Resource {
  constructor() { super() }

  public associateElasticIp(scope: Construct, ec2: CfnInstance, name: string): void {
    const elasticIp = new CfnEIP(scope, 'ElasticIpEc21a', {
      domain: 'vpc',
      tags: [{ key: 'Name', value: this.createResourceName(scope, `eip-${name}`) }]
    });

    new CfnEIPAssociation(scope, "Ec2Association", {
      eip: elasticIp.ref,
      instanceId: ec2.ref
    });
  }
}
