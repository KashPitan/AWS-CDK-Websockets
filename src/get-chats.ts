import * as AWS from 'aws-sdk';
import {getChatsQuery, IChat} from './types';
import {Chat} from './classes/Chat';


const mongoURI = process.env.MONGO_URI || '';


exports.handler = async (event: getChatsQuery): Promise<IChat[] | null> => {
  return Chat.getAllChats(mongoURI);
};
