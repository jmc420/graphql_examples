
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import log from 'loglevel';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import ws from 'ws';

const PORT = 8080;
const HOST = '0.0.0.0';

const gql = `
    type Query {
        sayHello(message:String!): String!
    }

    type Mutation {
        sendMessage(message:String!):String !
    }

    type Subscription {
        greeting: String!
    }
    `

const resolvers = {
    Query: {
        sayHello: (message) => {
            return "Hello to "+message
        },
    },
    Mutation: {
        sendMessage: ({ message }) => {
            return "You said " + message
        }
    },
    Subscription: {
        greeting: {
            subscribe: async function* () {
                for (const hi of ['Hi', 'Bonjour', 'Hola', 'Ciao', 'Zdravo']) {
                    yield { greeting: hi };
                }
            }
        }
    }
}

const schema = makeExecutableSchema({typeDefs: gql, resolvers})

export default async function webServer() {
    const handler = createHandler({ schema: schema });

    const app = express();

    app.all('/graphql', handler);

    const server = app.listen(PORT, HOST, () => {
        const wsServer = new ws.Server({
            server
        });
        useServer({ schema: schema }, wsServer);
        log.info(`Running on http://${HOST}:${PORT}`);
    });
}

log.setLevel(log.levels.INFO)

webServer();

