/* eslint-disable import/no-unresolved */
import * as AWS from 'aws-sdk';
// import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

// AWS.config.update({ region: 'eu-west-1' });

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

exports.handler = async (event: APIGatewayProxyEvent) => {
  const tableName = process.env.TABLE_NAME;

  if (!tableName) {
    throw new Error('tableName not specified in process.env.TABLE_NAME');
  }
  console.log('event ==> ', event);
  console.log('event. ==> ', event?.queryStringParameters?.chatId);

  const putParams = {
    TableName: tableName,
    Item: {
      connectionId: event.requestContext.connectionId,
      chatId: event?.queryStringParameters?.chatId,
    },
  };

  try {
    await Dynamo.put(putParams).promise();
  } catch (err) {
    return { statusCode: 500, body: `Failed to connect: ${JSON.stringify(err)}` };
  }

  return { statusCode: 200, body: 'Connected.' };
};
