import {connect} from '../mongoConnection';
import {ChatModel} from '../schemas/chatSchema';



export class Chat {
  name: string;

  constructor(name:string){
    this.name = name;
  }

  //get all the chats that match the input string
  static async getChats(mongoURI: string, name:string): Promise<Chat[] | null> {

    try {
      await connect(mongoURI);
      console.log('connected');
    } catch (error) {
     throw new Error (`Failed to Connect: ${error}`);
    }
  
    try {
      let chats;
      if(!name) chats = await ChatModel.find();
      else chats = await ChatModel.find({name});
  
      if(chats.length < 1 ) return null;
  
      let chatsReturn = chats.map((chat) => { return new Chat(chat.name)});

      return chatsReturn;
  
    }catch(error){
     throw new Error(`Error: ${JSON.stringify(error)}`)
    }
  }

  static async getAllChats(mongoURI: string): Promise<Chat[] | null> {
    try {
      await connect(mongoURI);
      console.log('connected');
    } catch (error) {
     throw new Error (`Failed to Connect: ${error}`);
    }

    try {
      let chats = await ChatModel.find();
  
      if(chats.length < 1 ) return null;
  
      let chatsReturn = chats.map((chat) => { return new Chat(chat.name)});

      return chatsReturn;
  
    }catch(error){
     throw new Error(`Error: ${JSON.stringify(error)}`)
    }

  }

  //create a new chat record from this class instance
  async createChat(mongoURI: string): Promise<boolean> {
    
    if(!this.name) throw new Error ('No chat name');
  
    try {
      await connect(mongoURI);
      console.log('connected');
    } catch (error) {
      throw new Error (`Failed to Connect: ${error}`);
    }
  
    try {
      const newChat = new ChatModel({
        name: this.name
      });
  
      let chat = await ChatModel.findOne({ name: this.name});
  
      if(chat){
       throw new Error('Chat with this name already exists');
      }
  
      await newChat.save();
      return true;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }
}