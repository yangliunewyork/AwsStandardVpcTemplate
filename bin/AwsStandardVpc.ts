#!/usr/bin/env node
import "source-map-support/register";
import * as CDK from "aws-cdk-lib";
import { VpcStack } from "../lib/VpcStack";
import { STAGE_ENV } from "../lib/config";

const PackageName = "CoreVpc";

const ProdEnv: CDK.Environment = {
  account: STAGE_ENV.PROD.awsAccountId,
  region: STAGE_ENV.PROD.awsRegion,
};
const app = new CDK.App();
new VpcStack(app, `${PackageName}`, {
  env: ProdEnv,
  description: `The core VPC.`,
});

app.synth();
