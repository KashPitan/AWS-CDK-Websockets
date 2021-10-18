import * as cdk from '@aws-cdk/core';
// import MyLambda from '../MyLambda';
import * as AWSGateway from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as AWSGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export class ChatStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const tableName = 'WebsocketConnections';
    const table = new dynamodb.Table(this, tableName, {
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      tableName: tableName,
    });

    const connectionsTablePolicy = 
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:UpdateItem','dynamodb:DeleteItem','dynamodb:Scan'],
        resources: [table.tableArn],
      });

    const connectLambda = new lambda.Function(this, 'connectLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'), 
      handler: 'connect.handler',
      initialPolicy: [connectionsTablePolicy],
      environment: {
        TABLE_NAME: tableName,
      },
    });

    // const lambdaRole = new iam.Role(this, `lambdaRole`, {
    //   roleName: `lambdaRole`,
    //   assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    // });

    const disconnectLambda = new lambda.Function(this, 'disconnectLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'disconnect.handler',
      initialPolicy: [connectionsTablePolicy],
      environment: {
        TABLE_NAME: tableName,
      },
      // role: lambdaRole
    });

    const messageLambda = new lambda.Function(this, 'messageLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      initialPolicy: [connectionsTablePolicy],
      handler: 'message.handler',
      environment: {
        TABLE_NAME: tableName,
      },
    });

    const createChatLambda = new lambda.Function(this, 'createChatLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'createChat.handler',
    });

    const defaultLambda = new lambda.Function(this, 'defaultLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'default.handler',
    });

    //extract websocket construct to another function later
    const webSocketApi = new AWSGateway.WebSocketApi(this, 'messagesWebsocketApi', {
      connectRouteOptions: { integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({ handler: connectLambda }) },
      disconnectRouteOptions: { integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({ handler: disconnectLambda }) },
      defaultRouteOptions: { integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({ handler: defaultLambda }) },
    });

    webSocketApi.addRoute('message', {
      integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({
        handler: messageLambda,
      }),
    });
    
    webSocketApi.addRoute('createChat', {
      integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({
        handler: createChatLambda,
      }),
    });

    const apiStage = new AWSGateway.WebSocketStage(this, 'DevStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    connectLambda.addToRolePolicy(connectionsTablePolicy);
    disconnectLambda.addToRolePolicy(connectionsTablePolicy);

    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${apiStage.stageName}/POST/*`,
      resource: webSocketApi.apiId,
    });

    messageLambda.addToRolePolicy(
      new iam.PolicyStatement({ actions: ['execute-api:ManageConnections'], resources: [connectionsArns] })
    );

    // //try and get the context variable (from cmd line or from cdk.context.json)
    // const environment = this.node.tryGetContext('environment');
    
  }
}
