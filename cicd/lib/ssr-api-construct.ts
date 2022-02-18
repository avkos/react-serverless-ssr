import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

type TProps = {
    region: string
    staticS3Bucket: s3.Bucket
    originAccessIdentity: cloudfront.OriginAccessIdentity
}

export class SsrApiConstruct extends Construct {
    constructor(scope: Construct, id: string, props: TProps) {
        super(scope, id);

        const ssrLambdaApi = new lambda.Function(scope, 'ssrApi', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../app/build-ssr'),
            handler: 'ssr.apiHandler'
        })
        const ssrApi = new apigw.LambdaRestApi(scope, 'Endpoint', {
            handler: ssrLambdaApi
        })
        const ssrApiDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            "ssr-api-cloudfront",
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
                        customOriginSource: {
                            domainName: `${ssrApi.restApiId}.execute-api.${props.region}.amazonaws.com`,
                            originPath: "/prod",
                            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
                        },
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                            }
                        ]
                    }
                ]
            }
        );
        new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
            sources: [s3deploy.Source.asset('../app/build-prod')],
            destinationBucket: props.staticS3Bucket,
            distribution:ssrApiDistribution,
            distributionPaths: ['/*'],
        });

        new cdk.CfnOutput(scope, "CF_SSR_API_URL", {
            value: `https://${ssrApiDistribution.distributionDomainName}`
        });
    }
}
