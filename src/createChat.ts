import { APIGatewayProxyEvent } from 'aws-lambda';
import {ChatModel} from './schemas/chatSchema';
import {connect} from './mongoConnection';

const mongoURI = process.env.MONGO_URI || '';

exports.handler = async (event: APIGatewayProxyEvent) => {
  console.log('create chat');
  if(!event.body) return { statusCode: 400, body: 'No request data' };

  const requestData = JSON.parse(event.body).data;

  if(!requestData) return { statusCode: 400, body: 'No chat name' };

  try {
    await connect(mongoURI);
    console.log('connected');
  } catch (error) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(error) };
  }

  try {
    const newChatName = requestData.chatName;
    const newChat = new ChatModel({
      name: newChatName
    });

    let chat = await ChatModel.findOne({name: newChatName});

    if(chat){
      return { statusCode: 400, body: 'Chat with this name already exists'};
    }

    await newChat.save();
    return { statusCode: 200, body: `Succesfully created new chat ${newChatName}`};

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify(error) };
  }
};
