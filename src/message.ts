import * as AWS from 'aws-sdk';
// import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';


const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

exports.handler = async (event: APIGatewayProxyEvent) => {
  console.log('message');
  // console.log(event);

  // if(event.body)console.log('event.body.data ==> ', JSON.parse(event.body).data);

  let connectionData;
  const tableName = process.env.TABLE_NAME || '';
  console.log('tableName ==> ', tableName);
  
  try {
    connectionData = await Dynamo.scan({ TableName: tableName, ProjectionExpression: 'connectionId' }).promise();
    console.log(connectionData);

  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }
  console.log(connectionData);
  
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const postData = event.body ? JSON.parse(event.body).data : '';
  
  if(connectionData.Items){
    const postCalls = connectionData.Items.map(async ({ connectionId }) => {
      try {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
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
  }else{
    return { statusCode: 200, body: "no connected users" };
  }
  return { statusCode: 200, body: "no action" };
};
