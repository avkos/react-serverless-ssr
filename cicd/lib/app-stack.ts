import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {StaticStack} from './static-stack'
import {SsrApiStack} from './ssr-api-stack'
import {SsrEdgeStack} from './ssr-edge-stack'

export class AppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const staticStack = new StaticStack(this, 'StaticStack')
        new SsrEdgeStack(this, 'SsrEdgeStack', {
            staticS3Bucket: staticStack.staticS3Bucket,
            originAccessIdentity: staticStack.originAccessIdentity
        })
        new SsrApiStack(this, 'SsrApiStack', {
            region: this.region
        })
    }
}
