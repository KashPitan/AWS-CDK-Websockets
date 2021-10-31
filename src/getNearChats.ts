/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
// import * as AWS from 'aws-sdk';
import { Chat } from './classes/Chat';
import { getNearChatsQuery } from './types';

const mongoURI = process.env.MONGO_URI || '';

// eslint-disable-next-line max-len
exports.handler = async (event: getNearChatsQuery): Promise<Chat[] | null> => Chat.getNearChats(mongoURI,
  {
    longitude: event.arguments.location.longitude,
    latitude: event.arguments.location.latitude,
  });
