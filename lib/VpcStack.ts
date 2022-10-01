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
        description: "Security group for granting AWS services access to the CoreVpc",
        allowAllOutbound: false,
      }
    );
    vpcEndpointSecurityGroup.addIngressRule(
      EC2.Peer.ipv4(this.coreVpc.vpcCidrBlock),
      EC2.Port.tcp(443),
      "Allow HTTPS ingress traffic"
    );

    vpcEndpointSecurityGroup.addEgressRule(
      EC2.Peer.ipv4(this.coreVpc.vpcCidrBlock),
      EC2.Port.tcp(443),
      "Allow HTTPS egress traffic"
    );

    const privateSubnets = this.coreVpc.selectSubnets(
      {
        subnetType: EC2.SubnetType.PRIVATE_ISOLATED
      }
    );

    // Grant AWS CodeBuild service access to the VPC's private subnets.
    new EC2.InterfaceVpcEndpoint(
      this, 'CodeBuildInterfaceVpcEndpoint', {
        service: EC2.InterfaceVpcEndpointAwsService.CODEBUILD,
        vpc: this.coreVpc,
        privateDnsEnabled: true,
        securityGroups: [vpcEndpointSecurityGroup],
        subnets: privateSubnets
      }
    );

    // Grant VPC access to S3 service.
    new EC2.GatewayVpcEndpoint(
      this, 'S3InterfaceVpcEndpoint', {
        service: EC2.GatewayVpcEndpointAwsService.S3,
        vpc: this.coreVpc,
      }
    );
  }
}
