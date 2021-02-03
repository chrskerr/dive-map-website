
// deps
const functions = require( "firebase-functions" );
const admin = require( "firebase-admin" );
const fetch = require( "node-fetch" );
const { ApolloServer, gql } = require( "apollo-server-express" );
const _ = require( "lodash" );
const express = require( "express" );

admin.initializeApp( functions.config().firebase );


// Create New User

const API_HOST = "https://dev-divemap.hasura.app/v1/graphql";
const HASURA_GRAPHQL_ADMIN_SECRET = functions.config().hasura.adminsecret;

const CREATE_USER = `
	mutation( $object: [users_insert_input!]! ) {
		insert_users (
			objects: $object, 
			on_conflict: { constraint: users_pkey, update_columns: uid }
		) {
			affected_rows
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

	await doQuery( CREATE_USER, { object: { uid, email, username: email }});
	await admin.auth().setCustomUserClaims( uid, {
		"https://hasura.io/jwt/claims": {
			"x-hasura-default-role": "user",
			"x-hasura-allowed-roles": [ "user" ],
			"x-hasura-user-id": uid,
		},
	});
	return `Created user: ${ uid }`;
});


// Hasura integration

const typeDefs = gql`
	type Query {
		null: Boolean
	}

	type Mutation {
		update_email( email: String! ): Boolean
		update_password( password: String! ): Boolean
	}
`;
const resolvers = {
	Query: { null: () => true },
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
