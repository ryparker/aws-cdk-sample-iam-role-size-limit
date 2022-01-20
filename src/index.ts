import { App, Stack, Stage } from "aws-cdk-lib";
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";
import * as fs from "fs";
import * as path from "path";

const GITHUB_ORG = "ryparker";
const GITHUB_REPO = "aws-cdk-sample-iam-role-size-limit";
const GITHUB_BRANCH = "main";
const AWS_CONNECTION_TO_GITHUB_REPO =
  "arn:aws:codestar-connections:us-east-1:495634646531:connection/9230518a-c38f-42ee-b7ec-c9fe9b4ffb0e";

const app = new App();

const stack = new Stack(app, "PipelinesStack");

// Deploy first pipeline that deploys the first 50 resources
const pipelineA = new CodePipeline(stack, "PipelineA", {
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
const lambdaStageA = new Stage(app, "LambdaStageA");
const lambdaStackA = new Stack(lambdaStageA, "LambdaStackA");
for (let i = 0; i <= 49; i++) {
  const pathToHandlerDir = path.join("src", "lambdas", `lambda-${i}`);

  !fs.existsSync(pathToHandlerDir) &&
    fs.mkdirSync(pathToHandlerDir, { recursive: true });
  fs.writeFileSync(
    path.join(pathToHandlerDir, "index.js"),
    `exports.handler = async (event) => {console.log("Hello from Lambda ${i}");};`,
    {
      flag: "w+",
    }
  );

  new Function(lambdaStackA, `Lambda${i}`, {
    code: Code.fromAsset(pathToHandlerDir),
    handler: `index.handler`,
    runtime: Runtime.NODEJS_14_X,
  });
}
pipelineA.addStage(lambdaStageA);

// Deploy first pipeline that deploys the next 50 resources
const pipelineB = new CodePipeline(stack, "PipelineB", {
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
const lambdaStageB = new Stage(app, "LambdaStageB");
const lambdaStackB = new Stack(lambdaStageB, "LambdaStackB");
for (let i = 50; i <= 99; i++) {
  const pathToHandlerDir = path.join("src", "lambdas", `lambda-${i}`);

  !fs.existsSync(pathToHandlerDir) &&
    fs.mkdirSync(pathToHandlerDir, { recursive: true });
  fs.writeFileSync(
    path.join(pathToHandlerDir, "index.js"),
    `exports.handler = async (event) => {console.log("Hello from Lambda ${i}");};`,
    {
      flag: "w+",
    }
  );

  new Function(lambdaStackB, `Lambda${i}`, {
    code: Code.fromAsset(pathToHandlerDir),
    handler: `index.handler`,
    runtime: Runtime.NODEJS_14_X,
  });
}
pipelineB.addStage(lambdaStageB);
