
// deps
const functions = require( "firebase-functions" );
const admin = require( "firebase-admin" );
const fetch = require( "node-fetch" );
const { ApolloServer, gql } = require( "apollo-server-express" );
const _ = require( "lodash" );
const express = require( "express" );
const GraphQLJSON = require( "graphql-type-json" );

admin.initializeApp( functions.config().firebase );


const API_HOST = "https://dev-divemap.hasura.app/v1/graphql";
const HASURA_GRAPHQL_ADMIN_SECRET = functions.config().hasura.adminsecret;


// Create New User
const CREATE_USER = `
	mutation( $object: users_insert_input! ) {
		insert_users_one( object: $object ) {
			id
		}
	}
`;

async function doQuery( query, variables ) {
	const response = await fetch( API_HOST, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-hasura-admin-secret": HASURA_GRAPHQL_ADMIN_SECRET,
		},
		body: JSON.stringify({ query, variables }),
	});
	return response.json();
}

exports.processSignUp = functions.auth.user().onCreate( async user => {
	const { uid, email } = user;

	const res = await doQuery( CREATE_USER, { object: { uid, email, username: email }});
	const id = _.get( res, "data.insert_users_one.id" );

	await admin.auth().setCustomUserClaims( uid, {
		"https://hasura.io/jwt/claims": {
			"x-hasura-default-role": "user",
			"x-hasura-allowed-roles": [ "user" ],
			"x-hasura-user-id": id,
		},
	});
	return `Created user: ${ id }`;
});


// Hasura integration
const INSERT_DIVE_REVISION = `
	mutation( $object: dive_revisions_insert_input! ) {
		insert_dive_revisions_one( object: $object ) {
			id
		}
  	}
`;

const typeDefs = gql`
	scalar JSON

	type Query {
		null: Boolean
	}

	type Mutation {
		update_email( email: String! ): Boolean
		update_password( password: String! ): Boolean
		create_dive_revision( id: String!, changes: JSON!, dive: JSON! ): ID
	}
`;
const resolvers = {
	Query: { null: () => true },
	JSON: GraphQLJSON,
	Mutation: {
		update_email: async ( parent, args, { headers }) => {
			try {
				const uid = _.get( headers, "x-hasura-user-id" );
				const email = _.get( args, "email" );

				if ( !uid || !email ) return false;

				const res = await admin.auth().updateUser( uid, { email });
				console.log( res );

				return true;
			} catch ( error ) {
				console.error( error );
				throw new Error( "Something went wrong. Please try again." );
			}
		},
		update_password: async ( parent, args, { headers }) => {
			try {
				const uid = _.get( headers, "x-hasura-user-id" );
				const password = _.get( args, "password" );

				if ( !uid || !password ) return false;

				const res = await admin.auth().updateUser( uid, { password });
				console.log( res );

				return true;
			} catch ( error ) {
				console.error( error );
				throw new Error( "Something went wrong. Please try again." );
			}
		},
		create_dive_revision: async ( parent, args, { headers }) => {
			try {
				const uid = _.get( headers, "x-hasura-user-id" );
				const id = _.get( args, "id" );
				const changes = _.get( args, "changes" );
				const dive = _.get( args, "dive" );

				if ( !uid || !id || !changes ) return false;

				const res = await doQuery( INSERT_DIVE_REVISION, { object: {
					changes, 
					_owner: uid,
					dive: {
						data: {
							...dive,
							...changes,
							id,
						}, 
						on_conflict: { 
							constraint: "dives_pkey", 
							update_columns: [ "name", "depth", "description", "dive_plan", "type", "coords" ], 
						},
					},
				}});
				console.log( res );

				return _.get( res, "data.insert_dive_revisions_one.id" );
			} catch ( error ) {
				console.error( error );
				throw new Error( "Something went wrong. Please try again." );
			}
		},
	},
};

const app = express();
const server = new ApolloServer({ 
	typeDefs, 
	resolvers,
	introspection: true,
	context: ({ req, res }) => ({
		headers: req.headers,
		req,
		res,
	}),
});
server.applyMiddleware({ 
	app, 
	path: "/",
	cors: {
		origin: "*",
		credentials: true,
		allowedHeaders: "Content-Type, Authorization",
	}, 
});

exports.graphql = functions.https.onRequest( app );
