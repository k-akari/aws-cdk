import { Construct } from 'constructs';
import { Repository, TagMutability } from 'aws-cdk-lib/aws-ecr';
import { Resource } from './abstract/resource';

interface ResourceInfo {
  readonly id: string;
  readonly repositoryName: string;
  readonly imageTagMutability: TagMutability
  readonly assign: (repository: Repository) => void;
}

export class Ecr extends Resource {
  public app: Repository;
  public web: Repository;

  private readonly resources: ResourceInfo[] = [
    {
      id: 'App',
      repositoryName: 'app',
      imageTagMutability: TagMutability.IMMUTABLE,
      assign: repository => this.app = repository
    },
    {
      id: 'Web',
      repositoryName: 'web',
      imageTagMutability: TagMutability.IMMUTABLE,
      assign: repository => this.web = repository
    },
  ];

  constructor(scope: Construct) {
    super();

    for (const resourceInfo of this.resources) {
      const repository = new Repository(scope, resourceInfo.id,
        { imageTagMutability: resourceInfo.imageTagMutability,
          repositoryName: this.createResourceName(scope, resourceInfo.repositoryName) }
      );
      resourceInfo.assign(repository);
    }
  }
}