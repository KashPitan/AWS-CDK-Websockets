/* eslint-disable import/no-unresolved */
/* eslint-disable import/prefer-default-export */
import { APIGatewayProxyEvent } from 'aws-lambda';

import * as AWS from 'aws-sdk';

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error('tableName not specified in process.env.TABLE_NAME');
  }

  const deleteParams = {
    TableName: tableName,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  // const deleteParams = {
  //   TableName: tableName,
  //   Key: {
  //     connectionId: event.requestContext.connectionId,
  //   },
  //   KeyConditionExpression: '#connectionId = :connectionId',
  //   ExpressionAttributeValues: {
  //     ':connectionId': event.requestContext.connectionId,
  //   },
  //   ExpressionAttributeNames: {
  //     '#connectionId': 'connectionId',
  //   },
  // };

  try {
    await Dynamo.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: `Failed to disconnect: ${JSON.stringify(err)}` };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};
