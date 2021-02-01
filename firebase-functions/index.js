
// deps
const functions = require( "firebase-functions" );
const admin = require( "firebase-admin" );
const _ = require( "lodash" );
const fetch = require( "node-fetch" );

//
// Adultletics / Firebase Functions / Index
//


admin.initializeApp( functions.config().firebase );

const API_HOST = "https://adultletics-hasura.herokuapp.com/v1/graphql";
const HASURA_GRAPHQL_ADMIN_SECRET = functions.config().hasura.adminsecret;

const CREATE_USER = `
	mutation createUser( $objects: [users_insert_input!]!, on_conflict: { constraint: users_email_key, update_columns: uid }) {
		insert_users( objects: $objects ) {
			returning { id }
		}
	}
`;

exports.processSignUp = functions.auth.user().onCreate( async user => {
	const { uid, email } = user;

	const res = await doQuery( CREATE_USER, { objects: [{ uid, email }]});
	const id = _.get( res, "data.insert_users.returning[0].id" );

	const customClaims = {
		"https://hasura.io/jwt/claims": {
			"x-hasura-default-role": "user",
			"x-hasura-allowed-roles": [ "user" ],
			"x-hasura-user-id": id,
		},
	};

	await admin.auth().setCustomUserClaims( uid, customClaims )
		.then(() => {
			const metadataRef = admin.database().ref( "metadata/" + uid );
			return metadataRef.set({ refreshTime: new Date().getTime() });
		})
		.catch( error => console.log( error ));

	return `Created user: ${ id }`;
});

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

exports.updateUserRoles = functions.https.onRequest( async ( req, res ) => {
	try {
		const admin_secret = _.get( req, "headers.admin_secret" );
		if ( admin_secret !== HASURA_GRAPHQL_ADMIN_SECRET ) {
			return res.status( 403 ).json({ error: "Unauthorized - Missing or incorrect admin token." });
		} else {
			const event = _.get( req, "body.event" );
			const id = _.get( event, "data.new.id" );
			const uid = _.get( event, "data.new.uid" );
			const role = _.get( event, "data.new.role" );

			const customClaims = {
				"https://hasura.io/jwt/claims": {
					"x-hasura-default-role": role,
					"x-hasura-allowed-roles": [ role ],
					"x-hasura-user-id": id,
				},
			};
            
			await admin.auth().setCustomUserClaims( uid, customClaims );
			return res.status( 200 ).send( "success" );
		}
	} catch ( error ) {
		console.error( error );
		return res.status( 500 ).json({ error: "Server Error" });
	}
});