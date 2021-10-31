/* eslint-disable max-len */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */
import { uuid } from 'uuidv4';
import { connect } from '../mongoConnection';
import { ChatModel } from '../schemas/chatSchema';
import { coordinates } from '../types';

export class Chat {
  name: string;

  id: string;

  location: coordinates;

  constructor(name:string, location: coordinates, id : string) {
    this.name = name;
    this.location = location;
    this.id = id;
  }

  // get all the chats in the nearby area
  static async getNearChats(mongoURI: string, location: coordinates): Promise<Chat[] | null> {
    try {
      await connect(mongoURI);
    } catch (error) {
      throw new Error(`Failed to Connect: ${error}`);
    }

    try {
      const chats = await ChatModel.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
            distanceField: 'distance',
            spherical: true,
            maxDistance: 2,
          },
        },
      ]);

      if (chats.length < 1) return null;

      const chatsReturn = chats.map((chat) => new Chat(
        chat.name,
        {
          longitude: chat.location.coordinates[0],
          latitude: chat.location.coordinates[1],
        },
        chat.id,
      ));

      return chatsReturn;
    } catch (error) {
      throw new Error(`Error: ${JSON.stringify(error)}`);
    }
  }

  static async getAllChats(mongoURI: string): Promise<Chat[] | null> {
    try {
      await connect(mongoURI);
    } catch (error) {
      throw new Error(`Failed to Connect: ${error}`);
    }

    try {
      const chats = await ChatModel.find();

      if (chats.length < 1) return null;

      const chatsReturn = chats.map((chat) => new Chat(
        chat.name,
        {
          longitude: chat.location.coordinates[0],
          latitude: chat.location.coordinates[1],
        },
        chat.id,
      ));

      return chatsReturn;
    } catch (error) {
      throw new Error(`Error: ${JSON.stringify(error)}`);
    }
  }

  // create a new chat record from this class instance
  static async createChat(mongoURI: string, name: string, location: coordinates): Promise<Chat> {
    if (!this.name) throw new Error('No chat name');

    try {
      await connect(mongoURI);
    } catch (error) {
      throw new Error(`Failed to Connect: ${error}`);
    }

    try {
      const id = uuid();
      const newChat = new ChatModel({
        name,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
        },
        id,
      });

      const chat = await ChatModel.findOne({ name: this.name });

      if (chat) {
        const error = new Error();
        error.message = 'Chat with this name already exists';
        throw error;
      }

      await newChat.save();

      return new Chat(name, location, id);
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }
}
