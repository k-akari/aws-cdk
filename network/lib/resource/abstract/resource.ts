import { Construct } from 'constructs';

export abstract class Resource {
    constructor() { }

    abstract createResources(scope: Construct): void;

    protected createResourceName(scope: Construct, originalName: string): string {
        const serviceName = scope.node.tryGetContext('serviceName');
        const envType = scope.node.tryGetContext('envType');
        const resourceNamePrefix = `${serviceName}-${envType}-`;

        return `${resourceNamePrefix}${originalName}`;
    }
}
