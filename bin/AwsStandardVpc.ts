#!/usr/bin/env node
import "source-map-support/register";
import * as CDK from "aws-cdk-lib";
import { VpcStack } from "../lib/VpcStack";

const PackageName = "CoreVpc";

const Env: CDK.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};
const app = new CDK.App();
new VpcStack(app, `${PackageName}`, {
  env: Env,
  description: `The core VPC.`,
});

app.synth();
