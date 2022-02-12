import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'

export class AppStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // static app
        const appBucketName = new cdk.CfnParameter(this, "appBucketName", {
            default: process.env.S3_NAME,
            type: "String",
            description: "Static site for react application"
        });
        const staticS3Bucket = new s3.Bucket(this, "ssr-bucket", {
            bucketName: appBucketName.valueAsString,
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            publicReadAccess: false,
            //only for demo not to use in production
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });
        new cdk.CfnOutput(this, "Bucket", {value: staticS3Bucket.bucketName});

        const originAccessIdentity = new cloudfront.OriginAccessIdentity(
            this,
            "ssr-app"
        );
        staticS3Bucket.grantRead(originAccessIdentity);

        new s3deploy.BucketDeployment(this, "React app", {
            sources: [s3deploy.Source.asset("../app/build/")],
            destinationBucket: staticS3Bucket
        });

        // SSR EDGE
        const ssrLambdaEdge = new lambda.Function(this, 'ssr', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../app/build-ssr'),
            handler: 'ssr.edgeHandler'
        })
        const ssrEdgeFunctionVersion = new lambda.Version(
            this,
            "ssrEdgeHandlerVersion"+new Date().toISOString(),
            {lambda: ssrLambdaEdge}
        );
        const distribution = new cloudfront.CloudFrontWebDistribution(
            this,
            "ssr-cloudfront",
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: staticS3Bucket,
                            originAccessIdentity: originAccessIdentity
                        },
                        behaviors: [
                            {
                                pathPattern: "/*.*",
                            },
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

        new cdk.CfnOutput(this, "CF EDGE URL", {
            value: `https://${distribution.distributionDomainName}`
        });

        // SSR API GW
        const ssrLambdaApi = new lambda.Function(this, 'ssrApi', {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset('../app/build-ssr'),
            handler: 'ssr.apiHandler'
        })
        const ssrApi = new apigw.LambdaRestApi(this, 'Endpoint', {
            handler: ssrLambdaApi
        })
        const apiDomainName = `${ssrApi.restApiId}.execute-api.${this.region}.amazonaws.com`;
        const distributionApi = new cloudfront.CloudFrontWebDistribution(
            this,
            "ssr-api-cloudfront",
            {
                originConfigs: [
                    {
                        s3OriginSource: {
                            s3BucketSource: staticS3Bucket,
                            originAccessIdentity: originAccessIdentity
                        },
                        behaviors: [
                            {
                                pathPattern: "/*.*",
                            }
                        ]
                    },
                    {
                        customOriginSource: {
                            domainName: apiDomainName,
                            originPath: "/prod",
                            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
                        },
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                                pathPattern: "*"
                            }
                        ]
                    }
                ]
            }
        );

        new cdk.CfnOutput(this, "CF API GW URL", {
            value: `https://${distributionApi.distributionDomainName}`
        });
    }
}
