export const enum STAGE  {
    PROD = "PROD",
}

interface StageVariables {
    stageName: string,
    awsAccountId?: string,
    awsRegion?: string,
}

export const STAGE_ENV: Record<STAGE, StageVariables> = {
    PROD: {
        stageName: STAGE.PROD,
        awsAccountId: "587395118549",
        awsRegion: "us-east-1"
    }
}