import { APIGatewayProxyEvent } from 'aws-lambda';
import {ChatModel} from './schemas/chatSchema';
import {connect} from './mongoConnection';
import {createChatQuery, IChat} from './types';
import {Chat} from './classes/Chat';
// import { mongo } from 'mongoose';

const mongoURI = process.env.MONGO_URI || '';

exports.handler = async (event: createChatQuery) : Promise<IChat> => {
  const newChat = new Chat(event.arguments.name);
  await newChat.createChat(mongoURI);
  return newChat;
};
