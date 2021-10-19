import * as AWS from 'aws-sdk';
import {ChatModel} from './schemas/chatSchema';
import {connect} from './mongoConnection';
import {getChatsQuery} from './types';

const mongoURI = process.env.MONGO_URI || '';


exports.handler = async (event: getChatsQuery) => {

  try {
    await connect(mongoURI);
    console.log('connected');
  } catch (error) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(error) };
  }

  try {
    let chats;
    if(!event.arguments) chats = await ChatModel.find();
    else chats = await ChatModel.find({name: event.arguments.name});

    if(chats.length < 1 ) return {statusCode: 200, body: 'No chats found'};

    return {statusCode: 200, body: JSON.stringify(chats)};

  }catch(error){
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
