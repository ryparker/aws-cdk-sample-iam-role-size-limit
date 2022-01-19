import { App, Stack, Stage } from "aws-cdk-lib";
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { Function, Code, Runtime } from "aws-cdk-lib/aws-lambda";

const app = new App();

const stack = new Stack(app, "pipeline");
const pipeline = new CodePipeline(stack, "AmwayCognitoPipeline", {
  synth: new ShellStep("Synth", {
    input: CodePipelineSource.connection(
      "ryparker/aws-cdk-sample-iam-role-size-limit",
      "main",
      {
        connectionArn:
          "arn:aws:codestar-connections:us-east-1:495634646531:connection/9230518a-c38f-42ee-b7ec-c9fe9b4ffb0e", // Created using the AWS console * });',
      }
    ),
    commands: ["yarn install", "yarn build", "yarn synth"],
  }),
});

const lambdaStage = new Stage(app, "LambdaStage");
const lambdaStack = new Stack(lambdaStage, "lambdas");
for (let i = 0; i <= 50; i++) {
  new Function(lambdaStack, `Lambda${i}`, {
    code: Code.fromInline(`
      exports.handler = async (event) => {
        console.log("Hello from Lambda ${i}");
      };
    `),
    handler: "index.handler",
    runtime: Runtime.NODEJS_14_X,
  });
}

pipeline.addStage(lambdaStage);
