import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as CDK from "aws-cdk-lib";
import * as EC2 from "aws-cdk-lib/aws-ec2";
import { Ec2Action } from "aws-cdk-lib/aws-cloudwatch-actions";

export interface VpcStackStackProps extends CDK.StackProps {
  readonly env: CDK.Environment;
  readonly description: string;
}

export class VpcStack extends Stack {
  private readonly coreVpc: EC2.Vpc;
  constructor(scope: CDK.App, id: string, props?: VpcStackStackProps) {
    super(scope, id, props);

    const vpcName: string = "CoreVpc";

    // Create VPC
    this.coreVpc = new EC2.Vpc(this, "CoreVpc", {
      vpcName: vpcName,
      cidr: "10.0.0.0/16",
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 3, // 3 availability zones
      // Each zone will have one public subnet and one private subnet.
      subnetConfiguration: [
        {
          cidrMask: 19,
          name: "PublicSubnet",
          subnetType: EC2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 19,
          name: "PrivateSubnet",
          subnetType: EC2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create security group for the VPC
    const vpcEndpointSecurityGroup = new EC2.SecurityGroup(
      this,
      `${vpcName}-VPCEndpointSecurityGroup`,
      {
        securityGroupName: `${vpcName}-VPCEndpointSecurityGroup`,
        vpc: this.coreVpc,
        description:
          "Security group for controling the traffic that is allowed to reach and leave the CoreVpc",
        allowAllOutbound: true,
      }
    );

    vpcEndpointSecurityGroup.addIngressRule(
      EC2.Peer.ipv4(this.coreVpc.vpcCidrBlock),
      EC2.Port.tcp(443),
      //EC2.Port.allTraffic(),
      "Allow TCP ingress traffic"
    );

    /*
    vpcEndpointSecurityGroup.addEgressRule(
      EC2.Peer.anyIpv4(),
      EC2.Port.allTcp(),
      "Allow TCP egress traffic"
    );
    */

    const privateSubnets: EC2.SelectedSubnets = this.coreVpc.selectSubnets({
      subnetType: EC2.SubnetType.PRIVATE_ISOLATED,
    });

    new EC2.InterfaceVpcEndpoint(this, "LambdaInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.LAMBDA,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "SQSInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.SQS,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "SNSInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.SNS,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "CodeWatchInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.CLOUDWATCH,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "CodeWatchLogsInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "CodeWatchEventsInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.CLOUDWATCH_EVENTS,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    new EC2.InterfaceVpcEndpoint(this, "CodeBuildInterfaceVpcEndpoint", {
      service: EC2.InterfaceVpcEndpointAwsService.CODEBUILD,
      vpc: this.coreVpc,
      privateDnsEnabled: true,
      securityGroups: [vpcEndpointSecurityGroup],
      subnets: privateSubnets,
    });

    // Grant VPC access to S3 service.
    new EC2.GatewayVpcEndpoint(this, "S3InterfaceVpcEndpoint", {
      service: EC2.GatewayVpcEndpointAwsService.S3,
      vpc: this.coreVpc,
    });

    // Grant VPC access to DynamoDB.
    new EC2.GatewayVpcEndpoint(this, "DynamoDBInterfaceVpcEndpoint", {
      service: EC2.GatewayVpcEndpointAwsService.DYNAMODB,
      vpc: this.coreVpc,
    });
  }
}
