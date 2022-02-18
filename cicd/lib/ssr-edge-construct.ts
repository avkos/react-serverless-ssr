import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

type TProps = {
    staticS3Bucket: s3.Bucket
    originAccessIdentity: cloudfront.OriginAccessIdentity
}

export class SsrEdgeConstruct extends Construct {
    constructor(scope: Construct, id: string, props: TProps) {
        super(scope, id);

        const ssrLambdaEdge = new lambda.Function(scope, 'ssr', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../app/build-ssr'),
            handler: 'ssr.edgeHandler'
        });

        const ssrEdgeFunctionVersion = new lambda.Version(
            scope,
            "ssr-edge-handler-version" + new Date().toISOString(),
            {lambda: ssrLambdaEdge}
        );

        const ssrEdgeDistribution = new cloudfront.CloudFrontWebDistribution(
            scope,
            "ssr-edge-cloudfront",
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: props.staticS3Bucket,
                            originAccessIdentity: props.originAccessIdentity
                        },
                        behaviors: [
                            {
                                pathPattern: '/static/*.*',
                            },
                            {
                                pathPattern: '/static/js/*.*',
                            },
                            {
                                pathPattern: '/static/css/*.*',
                            },
                            {
                                pathPattern: '/favicon.ico',
                            },
                            {
                                pathPattern: '/manifest.json',
                            },
                            {
                                pathPattern: '/logo192.png',
                            }
                        ]
                    },
                    {
                        s3OriginSource: {
                            s3BucketSource: props.staticS3Bucket,
                            originAccessIdentity: props.originAccessIdentity
                        },
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                                lambdaFunctionAssociations: [
                                    {
                                        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
                                        lambdaFunction: ssrEdgeFunctionVersion
                                    }
                                ]
                            }
                        ]
                    },
                ]
            }
        );
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset('../app/build-prod')],
            destinationBucket: props.staticS3Bucket,
            distribution:ssrEdgeDistribution,
            distributionPaths: ['/*'],
        });

        new cdk.CfnOutput(scope, "CF_SSR_EDGE_URL", {
            value: `https://${ssrEdgeDistribution.distributionDomainName}`
        });
    }
}
