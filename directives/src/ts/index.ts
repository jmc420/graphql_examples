import { buildSchema, DocumentNode, GraphQLError, GraphQLSchema, parse, validateSchema } from "graphql";
import { validateSDL } from "graphql/validation/validate.js";

export interface IGQLParserResult {
    errors: readonly GraphQLError[];
    gqlSchema?: GraphQLSchema;
}

export function gqlParse(gql: string): IGQLParserResult {
    try {
        const document: DocumentNode = parse(gql, { noLocation: false });
        const errors: GraphQLError[] = validateSDL(document);

        if (errors.length > 0) {
            return {
                errors: errors,
            }
        }
        const gqlSchema: GraphQLSchema = buildSchema(gql);
        const validatationErrors: readonly GraphQLError[] = validateSchema(gqlSchema);

        if (validatationErrors.length > 0) {
            return {
                errors: validatationErrors,
            }
        }

        return {
            errors: [],
            gqlSchema: gqlSchema
        }
    }
    catch (e) {
        console.log("Error "+typeof(e))
        return {
            errors: [e]
        }
    }
}

const qglErrorExpected = `
input Data {
    someField: String!
    anotherField: String!
}
directive @someDirective( args: [Data!]! ) on OBJECT

type SomeType @someDirective( args: [{someField: "blah", anotherField: "blah"}] ) 
{
    column1: String
}
type AnotherType @someDirective( args: [{blah: "blah", blah2: "blah"}] ) 
{
    column2: String
}

type Query {
  empty: String
}
`;

function printErrors(result: IGQLParserResult) {
    if (result.errors.length > 0) {
        result.errors.map((error: GraphQLError) => {
            console.log("Error " + error.message + " Location " + getLocation(error));
        })
    }
    else {
        console.log("No errors")
    }
   
}

function getLocation(error: GraphQLError) {

    if (error.locations != null && error.locations.length > 0) {
        const location = error.locations[0];

        return " Line: " + location.line + " Column: " + location.column;
    }
    return "";
}
const result = gqlParse(qglErrorExpected);

printErrors(result);


