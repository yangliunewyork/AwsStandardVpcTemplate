import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as CDK from "aws-cdk-lib";
import * as EC2 from "aws-cdk-lib/aws-ec2";

export interface VpcStackStackProps extends CDK.StackProps {
  readonly env: CDK.Environment;
  readonly description: string;
}

export class VpcStack extends Stack {
  private readonly coreVpc: EC2.Vpc;
  constructor(scope: CDK.App, id: string, props?: VpcStackStackProps) {
    super(scope, id, props);

    this.coreVpc = new EC2.Vpc(this, "CoreVpc", {
      vpcName: "CoreVpc",
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
  }
}
