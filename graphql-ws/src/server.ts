
import express from 'express';
import { buildSchema, GraphQLSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import log from 'loglevel';
import { useServer } from 'graphql-ws/lib/use/ws';
import ws from 'ws';

const PORT = 8080;
const HOST = '0.0.0.0';

function getSchema(): GraphQLSchema {
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

const resolvers = {
    sayHello: () => {
        return "Hello"
    },
    sendMessage: ({ message }) => {
        return "You said " + message
    }
}

const rootValue = {
    subscription: {
        greeting: async function* () {
            for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
                yield { greetings: hi };
            }
        }
    }
}

export default async function webServer() {
    const schema: GraphQLSchema = getSchema();
    const handler = createHandler({ schema: schema, rootValue: resolvers });

    const app = express();

    app.all('/graphql', handler);

    const server = app.listen(PORT, HOST, () => {
        const wsServer = new ws.Server({
            server
        });
        useServer({ schema: schema, roots: rootValue }, wsServer);
        log.info(`Running on http://${HOST}:${PORT}`);
    });
}

log.setLevel(log.levels.INFO)

webServer();

