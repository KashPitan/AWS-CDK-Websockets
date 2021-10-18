
import { APIGatewayProxyEvent } from 'aws-lambda';

import * as AWS from 'aws-sdk';

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log('disconnected ==> ');

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

  try {
    await Dynamo.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};