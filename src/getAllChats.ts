/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
// import * as AWS from 'aws-sdk';
import { Chat } from './classes/Chat';

const mongoURI = process.env.MONGO_URI || '';

exports.handler = async (): Promise<Chat[] | null> => Chat.getAllChats(mongoURI);
