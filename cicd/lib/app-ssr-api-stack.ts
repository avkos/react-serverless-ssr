import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {StaticConstruct} from './static-construct'
import {SsrApiConstruct} from './ssr-api-construct'

export class AppSsrApiStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const staticConstruct = new StaticConstruct(this, 'StaticStack', {
            buildPath: '../app/build-prod/',
            bucketName: 'static-ssr-api'
        })
        new SsrApiConstruct(this, 'SsrApiStack', {
            region: this.region,
            staticS3Bucket: staticConstruct.staticS3Bucket,
            originAccessIdentity: staticConstruct.originAccessIdentity
        })
    }
}
