import {Construct} from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'

export class StaticStack extends Construct {
    public staticS3Bucket: s3.Bucket
    public originAccessIdentity: cloudfront.OriginAccessIdentity

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const appBucketName = new cdk.CfnParameter(scope, "appBucketName", {
            default: process.env.S3_NAME,
            type: "String",
            description: "Static site for react application"
        });
        this.staticS3Bucket = new s3.Bucket(scope, "ssr-bucket", {
            bucketName: appBucketName.valueAsString,
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            publicReadAccess: false,
            //only for demo not to use in production
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        new cdk.CfnOutput(scope, "Bucket", {value: this.staticS3Bucket.bucketName});

        this.originAccessIdentity = new cloudfront.OriginAccessIdentity(
            scope,
            "ssr-app"
        );
        this.staticS3Bucket.grantRead(this.originAccessIdentity);

        new s3deploy.BucketDeployment(scope, "React app", {
            sources: [s3deploy.Source.asset("../app/build/")],
            destinationBucket: this.staticS3Bucket
        });
        const staticS3Distribution = new cloudfront.CloudFrontWebDistribution(
            scope,
            "static-cloudfront",
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: this.staticS3Bucket,
                            originAccessIdentity: this.originAccessIdentity
                        },
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                            }
                        ]
                    },
                ]
            }
        );

        new cdk.CfnOutput(scope, "CF_STATIC_URL", {
            value: `https://${staticS3Distribution.distributionDomainName}`
        });

    }
}
