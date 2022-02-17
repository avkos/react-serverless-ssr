import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as cdk from 'aws-cdk-lib'
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

type TProps = {
    region: string
}

export class SsrApiStack extends Construct {
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
        const apiDomainName = `${ssrApi.restApiId}.execute-api.${props.region}.amazonaws.com`;
        const ssrApiDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            "ssr-api-cloudfront",
            {
                originConfigs: [
                    {
                        customOriginSource: {
                            domainName: apiDomainName,
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

        new cdk.CfnOutput(scope, "CF_SSR_API_URL", {
            value: `https://${ssrApiDistribution.distributionDomainName}`
        });
    }
}
