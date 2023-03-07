import express from 'express';
import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import log from 'loglevel';
import { useServer } from 'graphql-ws/lib/use/ws';
import ws from 'ws';
const PORT = 8080;
const HOST = '0.0.0.0';
function getSchema() {
    const gql = `
    type Query {
        sayHello: String!
      }
      
      type Mutation {
        sendMessage(message:String!):String !
      }
      
      type Subscription {
          greeting: String!
      }
    `;
    return buildSchema(gql);
}
const rootValue = {
    sayHello: () => {
        return "Hello";
    },
    sendMessage: ({ message }) => {
        return "You said " + message;
    },
    greeting: {
        subscribe: async function* () {
            for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
                yield { greetings: hi };
            }
        }
    }
};
export default async function webServer() {
    const schema = getSchema();
    const handler = createHandler({ schema: schema, rootValue: rootValue });
    const app = express();
    app.all('/graphql', handler);
    const server = app.listen(PORT, HOST, () => {
        const wsServer = new ws.Server({
            server,
            path: '/graphql',
        });
        useServer({ schema: schema }, wsServer);
        log.info(`Running on http://${HOST}:${PORT}`);
    });
}
log.setLevel(log.levels.INFO);
webServer();
