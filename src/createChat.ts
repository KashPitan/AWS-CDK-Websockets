/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { createChatQuery } from './types';
import { Chat } from './classes/Chat';

const mongoURI = process.env.MONGO_URI || '';

exports.handler = async (event: createChatQuery) : Promise<Chat> => {
  const newChat = await Chat.createChat(
    mongoURI,
    event.arguments.name,
    {
      longitude: event.arguments.location.longitude,
      latitude: event.arguments.location.latitude,
    },
  );
  return newChat;
};
