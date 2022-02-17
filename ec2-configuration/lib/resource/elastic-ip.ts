import { Construct } from 'constructs';
import { CfnEIP } from 'aws-cdk-lib/aws-ec2';
import { Resource } from './abstract/resource';

interface ElasticIpInfo {
  readonly id: string;
  readonly name: string;
  readonly assign: (elasticIp: CfnEIP) => void;
}

export class ElasticIp extends Resource {
  public ngw1a: CfnEIP;

  private readonly elasticIpInfos: ElasticIpInfo[] = [
    {
      id: 'ElasticIpNgw1a',
      name: 'eip-ngw-1a',
      assign: elasticIp => this.ngw1a = elasticIp
    }
  ];

  constructor(scope: Construct) {
    super();

    for (const elasticIpInfo of this.elasticIpInfos) {
      const elasticIp = this.createElasticIp(scope, elasticIpInfo);
      elasticIpInfo.assign(elasticIp);
    }
  }

  private createElasticIp(scope: Construct, elasticIpInfo: ElasticIpInfo): CfnEIP {
    const elasticIp = new CfnEIP(scope, elasticIpInfo.id, {
      domain: 'vpc',
      tags: [{ key: 'Name', value: this.createResourceName(scope, elasticIpInfo.name) }]
    });
    return elasticIp;
  }
}
