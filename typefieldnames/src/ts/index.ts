import { buildSchema, DocumentNode, FieldDefinitionNode, GraphQLError, GraphQLNamedType, GraphQLObjectType, GraphQLSchema, ObjectTypeDefinitionNode, parse, validateSchema } from "graphql";
import { Maybe } from "graphql/jsutils/Maybe.js";
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
        console.log("Error " + typeof (e))
        return {
            errors: [e]
        }
    }
}


function printTypeFieldNames(gqlSchema: GraphQLSchema) {
    const typeMap = gqlSchema.getTypeMap();
    const objectTypes: ObjectTypeDefinitionNode[] = [];
  
    Object.keys(typeMap).forEach(key => {
      const type: GraphQLNamedType = typeMap[key];
      const objectType: GraphQLObjectType = type as GraphQLObjectType;
      const astNode: Maybe<ObjectTypeDefinitionNode> = objectType.astNode;
  
      if (astNode != null && astNode.kind == 'ObjectTypeDefinition') {
        objectTypes.push(astNode);
      }
    })
  
    objectTypes.map((objectType) => {
        const typeName = objectType.name.value;

        console.log("\nType: "+typeName+" has following fields:\n ")
        const fields: readonly FieldDefinitionNode[] = objectType.fields;

        fields.forEach((field: FieldDefinitionNode) => {
            console.log("\tField name: "+field.name.value);
        })
    })
}

const gql = `

type Ship {
    id: ID!
    name: String!
    owner: ShipOwner!
}

type ShipOwner {
    id: ID!
    name: String!
    vessels: [Ship!]!
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
const result: IGQLParserResult = gqlParse(gql);

if (result.errors.length > 0) {
    printErrors(result);
}
else {
    printTypeFieldNames(result.gqlSchema);
}



