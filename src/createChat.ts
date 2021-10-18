// import * as AWS from 'aws-sdk';
// import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
import mongoose from 'mongoose';

const mongoURI = process.env.MONGO_URI || '';

exports.handler = async (event: APIGatewayProxyEvent) => {
  console.log('create chat ==> 2');

  // mongoose.connect(mongoURI).then(()=> {console.log('connected to mongo')}).catch((err: any) => console.log( err));

  try {
    await mongoose.connect(mongoURI);
    console.log('connected');
  } catch (error) {
    console.log(error);
  }

  // const tableName = process.env.TABLE_NAME;

  // if (!tableName) {
  //   throw new Error('tableName not specified in process.env.TABLE_NAME');
  // }

  // try {
  //   // const res = await Dynamo.put(putParams).promise();
  // } catch (err) {
  //   return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  // }

  return { statusCode: 200, body: 'Connected.' };
};
