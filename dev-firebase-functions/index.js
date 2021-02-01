
// deps
const functions = require( "firebase-functions" );
const admin = require( "firebase-admin" );
const fetch = require( "node-fetch" );


admin.initializeApp( functions.config().firebase );

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

exports.processSignUp = functions.auth.user().onCreate( async user => {
	const { uid, email } = user;

	await doQuery( CREATE_USER, { object: { uid, email, username: email }});

	const customClaims = {
		"https://hasura.io/jwt/claims": {
			"x-hasura-default-role": "user",
			"x-hasura-allowed-roles": [ "user" ],
			"x-hasura-user-id": uid,
		},
	};

	await admin.auth().setCustomUserClaims( uid, customClaims )
		.then(() => {
			const metadataRef = admin.database().ref( "metadata/" + uid );
			return metadataRef.set({ refreshTime: new Date().getTime() });
		})
		.catch( error => console.log( error ));

	return `Created user: ${ uid }`;
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

// exports.updateUserRoles = functions.https.onRequest( async ( req, res ) => {
// 	try {
// 		const admin_secret = _.get( req, "headers.admin_secret" );
// 		if ( admin_secret !== HASURA_GRAPHQL_ADMIN_SECRET ) {
// 			return res.status( 403 ).json({ error: "Unauthorized - Missing or incorrect admin token." });
// 		} else {
// 			const event = _.get( req, "body.event" );
// 			const uid = _.get( event, "data.new.uid" );
// 			const role = _.get( event, "data.new.role" );

// 			const customClaims = {
// 				"https://hasura.io/jwt/claims": {
// 					"x-hasura-default-role": role,
// 					"x-hasura-allowed-roles": [ role ],
// 					"x-hasura-user-id": uid,
// 				},
// 			};
            
// 			await admin.auth().setCustomUserClaims( uid, customClaims );
// 			return res.status( 200 ).send( "success" );
// 		}
// 	} catch ( error ) {
// 		console.error( error );
// 		return res.status( 500 ).json({ error: "Server Error" });
// 	}
// });