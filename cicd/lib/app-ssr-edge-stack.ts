import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {StaticConstruct} from './static-construct'
import {SsrEdgeConstruct} from './ssr-edge-construct'

export class AppSsrEdgeStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const staticConstruct = new StaticConstruct(this, 'StaticEdgeStack', {
            buildPath: '../app/build-prod/',
            bucketName: 'static-ssr-edge'
        })
        new SsrEdgeConstruct(this, 'SsrEdgeStack', {
            staticS3Bucket: staticConstruct.staticS3Bucket,
            originAccessIdentity: staticConstruct.originAccessIdentity
        })
    }
}
