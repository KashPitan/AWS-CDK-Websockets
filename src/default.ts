import * as AWS from 'aws-sdk';
// import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

// AWS.config.update({ region: 'eu-west-1' });

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });


exports.handler = async (event: APIGatewayProxyEvent) => {
  console.log('default ==> ');

  return { statusCode: 200, body: 'default' };
};
