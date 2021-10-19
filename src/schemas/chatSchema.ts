import { Schema, model } from 'mongoose';

interface Chat {
  name: string;
  // users: [string] | null;
  // messages: [string]
}

const ChatSchema = new Schema<Chat>({
  name : {type: String, required: true}
});

export const ChatModel = model<Chat>('Chat', ChatSchema);

// export chatModel;

