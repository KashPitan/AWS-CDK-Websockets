/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable import/prefer-default-export */
import * as cdk from '@aws-cdk/core';
import * as AWSGateway from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as AWSGatewayIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';
import * as ssm from '@aws-cdk/aws-ssm';
import * as appsync from '@aws-cdk/aws-appsync';

export class ChatStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const tableName = 'WebsocketConnections4';
    const table = new dynamodb.Table(this, tableName, {
      // sortKey: { name: 'chatId', type: dynamodb.AttributeType.STRING },
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      tableName,
    });

    const mongoUri = ssm.StringParameter.fromStringParameterName(this, 'mongoUri', 'kashMongoUri').stringValue;

    const connectionsTablePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem', 'dynamodb:Scan'],
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

    const disconnectLambda = new lambda.Function(this, 'disconnectLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'disconnect.handler',
      initialPolicy: [connectionsTablePolicy],
      environment: {
        TABLE_NAME: tableName,
      },
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

    // extract websocket construct to another function and rename later
    const webSocketApi = new AWSGateway.WebSocketApi(this, 'messagesWebsocketApi', {
      connectRouteOptions: { integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({ handler: connectLambda }) },
      disconnectRouteOptions: { integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({ handler: disconnectLambda }) },
    });

    webSocketApi.addRoute('message', {
      integration: new AWSGatewayIntegrations.LambdaWebSocketIntegration({
        handler: messageLambda,
      }),
    });

    const apiStage = new AWSGateway.WebSocketStage(this, 'DevStage', {
      webSocketApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    // rename later
    const api = new appsync.GraphqlApi(this, 'chat-service', {
      name: 'kash-graphql-api',
      schema: appsync.Schema.fromAsset('lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          // authorizationType: appsync.AuthorizationType.IAM,
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    const getNearChatsLambda = new lambda.Function(this, 'getNearChatsLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'getNearChats.handler',
      environment: {
        MONGO_URI: mongoUri,
      },
    });

    const getAllChatsLambda = new lambda.Function(this, 'getAllChatsLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'getAllChats.handler',
      environment: {
        MONGO_URI: mongoUri,
      },
    });

    const createChatLambda = new lambda.Function(this, 'createChatLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('dist'),
      handler: 'createChat.handler',
      environment: {
        MONGO_URI: mongoUri,
      },
    });

    const getNearChatsDataSource = api.addLambdaDataSource('getNearChatsDataSource', getNearChatsLambda);
    getNearChatsDataSource.createResolver({ typeName: 'Query', fieldName: 'getNearChats' });

    const getAllChatsLambdaDataSource = api.addLambdaDataSource('getChatsDataSource', getAllChatsLambda);
    getAllChatsLambdaDataSource.createResolver({ typeName: 'Query', fieldName: 'getAllChats' });

    const createChatsDataSource = api.addLambdaDataSource('createChatsDataSource', createChatLambda);
    createChatsDataSource.createResolver({ typeName: 'Mutation', fieldName: 'createChat' });

    connectLambda.addToRolePolicy(connectionsTablePolicy);
    disconnectLambda.addToRolePolicy(connectionsTablePolicy);

    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${apiStage.stageName}/POST/*`,
      resource: webSocketApi.apiId,
    });

    messageLambda.addToRolePolicy(
      new iam.PolicyStatement({ actions: ['execute-api:ManageConnections'], resources: [connectionsArns] }),
    );

    // //try and get the context variable (from cmd line or from cdk.context.json)
    // const environment = this.node.tryGetContext('environment');
  }
}
