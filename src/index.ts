import { App, Stack, Stage } from "aws-cdk-lib";
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";

const GITHUB_ORG = "ryparker";
const GITHUB_REPO = "aws-cdk-sample-iam-role-size-limit";
const GITHUB_BRANCH = "main";
const AWS_CONNECTION_TO_GITHUB_REPO =
  "arn:aws:codestar-connections:us-east-1:495634646531:connection/9230518a-c38f-42ee-b7ec-c9fe9b4ffb0e";

const app = new App();

const stack = new Stack(app, "pipeline");
const pipeline = new CodePipeline(stack, "AmwayCognitoPipeline", {
  synth: new ShellStep("Synth", {
    input: CodePipelineSource.connection(
      `${GITHUB_ORG}/${GITHUB_REPO}`,
      GITHUB_BRANCH,
      {
        connectionArn: AWS_CONNECTION_TO_GITHUB_REPO,
      }
    ),
    commands: ["yarn install", "yarn build"],
    primaryOutputDirectory: "build/cloudformation",
  }),
});

const lambdaStage = new Stage(app, "LambdaStage");
const lambdaStack = new Stack(lambdaStage, "LambdaStage");
for (let i = 0; i <= 100; i++) {
  new Function(lambdaStack, `Lambda${i}`, {
    code: Code.fromAsset("src/lambdas"),
    handler: "hello-world.handler",
    runtime: Runtime.NODEJS_14_X,
  });
}
pipeline.addStage(lambdaStage);
