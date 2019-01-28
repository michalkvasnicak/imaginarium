import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { createServer, proxy } from 'aws-serverless-express';
import app from './app';

const server = createServer(app, undefined, ['image/*']);

function handler(event: APIGatewayProxyEvent, context: Context) {
  proxy(server, event, context);
}

if (process.env.RUN_SERVER) {
  server.listen(3000);
}

export { handler };
