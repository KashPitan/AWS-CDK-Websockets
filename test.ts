/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as AWS from 'aws-sdk';
import { connect } from './src/mongoConnection';
import { ChatModel } from './src/schemas/chatSchema';

const Dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'eu-west-1' });

const run = async () => {
  try {
    await connect('mongodb+srv://chatApp:chatApp@cluster0.l1bk8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority');
  } catch (error) {
    throw new Error(`Failed to Connect: ${error}`);
  }

  try {
    const chats = await ChatModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [-0.2022666, 51.3802497],
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 50000,
        },
      },
    ]);
    console.log('chats ==> ', chats);
  } catch (error) {
    throw new Error(`Failed to Connect: ${error}`);
  }
};

AWS.config.update({ region: 'eu-west-1' });

const run2 = async () => {
  try {
    const connectionData = await Dynamo.scan({
      TableName: 'WebsocketConnections4',
      FilterExpression: '#chatId = :chatId',
      ProjectionExpression: 'connectionId',
      ExpressionAttributeNames: {
        '#chatId': 'chatId',
      },
      ExpressionAttributeValues: {
        ':chatId': '07e6c146-4663-4229-b7c7-7e03150fc657',
      },
    }).promise();

    console.log('connectionData ==> ', connectionData);
  } catch (error) {
    console.log('error ==> ', error);
  }
};

// run();

run2();
