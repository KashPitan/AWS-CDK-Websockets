/* eslint-disable import/no-unresolved */
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'eu-west-1' });

exports.handler = async (event: APIGatewayProxyEvent) => {
  let connectionData;
  const tableName = process.env.TABLE_NAME || '';

  const chatId = event.body ? JSON.parse(event.body).data.chatId : '';

  try {
    connectionData = await Dynamo.scan({
      TableName: tableName,
      FilterExpression: '#chatId = :chatId',
      ProjectionExpression: 'connectionId',
      ExpressionAttributeNames: {
        '#chatId': 'chatId',
      },
      ExpressionAttributeValues: {
        ':chatId': chatId,
      },
    }).promise();

    console.log('connectionData ==> ', connectionData);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  const postData = event.body ? JSON.parse(event.body).data.message : '';

  if (connectionData.Items) {
    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
      try {
        await apigwManagementApi.postToConnection(
          {
            ConnectionId: connectionId,
            Data: postData,
          },
        ).promise();
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`);
          await Dynamo.delete({ TableName: tableName, Key: { connectionId } }).promise();
        } else {
          throw e;
        }
      }
    });

    try {
      await Promise.all(postCalls);
    } catch (e) {
      return { statusCode: 500, body: e.stack };
    }
  } else {
    return { statusCode: 200, body: 'no connected users' };
  }
  return { statusCode: 200, body: 'no action' };
};
