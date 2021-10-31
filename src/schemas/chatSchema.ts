/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { Schema, model } from 'mongoose';
import { IChat } from '../types';

const LocationSchema = new Schema({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
  },
});

const ChatSchema = new Schema<IChat>({
  name: { type: String, required: true },
  location: LocationSchema,
  id: { type: String, required: true },
});

// ChatSchema.index({ location: '2dsphere' });

export const ChatModel = model<IChat>('Chat', ChatSchema);
