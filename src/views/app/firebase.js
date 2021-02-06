
// Packages
import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import "firebase/auth";
import _ from "lodash";
import { gql, useQuery } from "@apollo/client";

// App
import { State } from "../index";

const GET_USER = gql`
	query GetUser( $uid: String! ) {
		users( where: { uid: { _eq: $uid }}, limit: 1 ) {
			id uid email username
		}
	}
`;

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
	storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp( firebaseConfig );

export default function FirebaseProvider ({ children }) {
	const [ state, dispatch ] = useContext( State );
	const { token, persistor, hasHasuraClaims } = _.get( state, "auth" );

	const firebaseAuth = firebase.auth();
	const currentFirebaseUser = _.get( firebaseAuth, "currentUser" );

	useEffect(() => {
		dispatch({ 
			type: "auth",
			signIn: async ( email, password ) => {
				dispatch({ type: "auth", isAuthenticating: true });
				return await firebaseAuth.signInWithEmailAndPassword( email, password );
			},
			createAccount: async ( email, password ) => {
				dispatch({ type: "auth", isAuthenticating: true });
				const { user } = await firebaseAuth.createUserWithEmailAndPassword( email, password );

				const getClaims = async ( loop = 0, resolve ) => {
					if ( loop === 30 ) return resolve();
					return await new Promise( resolve => setTimeout( async () => {
						await user.getIdToken( true );
						const idTokenResult = await user.getIdTokenResult();
						const hasuraClaims = idTokenResult.claims[ "https://hasura.io/jwt/claims" ];
						if ( !hasuraClaims ) await getClaims( loop + 1, resolve );
						resolve();
					}, 100 ));
				};

				return getClaims();
			},
			signOut: () => {
				firebaseAuth.signOut();
				dispatch({ type: "userPurge" });
				if ( persistor ) persistor.purge();
			},
		});
	}, []);

	useEffect(() => {
		return firebaseAuth.onIdTokenChanged( async user => {
			dispatch({ type: "auth", isAuthenticating: true });

			if ( user ) {
				const token = await user.getIdToken();
				dispatch({ type: "auth", token });
				dispatch({ type: "user", uid: user.uid });

				const idTokenResult = await user.getIdTokenResult();
				const hasuraClaim = idTokenResult.claims[ "https://hasura.io/jwt/claims" ];
				
				if ( hasuraClaim ) dispatch({ type: "auth", hasHasuraClaims: true, isAuthenticated: true, isAuthenticating: false });
				else dispatch({ type: "auth", hasHasuraClaims: false, isAuthenticated: false });
			}
			else {
				dispatch({ type: "auth", token: null, isAuthenticating: false, isAuthenticated: false });
				dispatch({ type: "user", uid: "" });
			}
		});
	}, []);

	useEffect(() => {
		if ( token && currentFirebaseUser ) {
			if ( hasHasuraClaims ) dispatch({ type: "auth", isAuthenticated: true, isAuthenticating: false });
			else setTimeout(() => currentFirebaseUser.getIdToken( true ), 500 );
		}
		else {
			dispatch({ type: "auth", isAuthenticated: false, isAuthenticating: false, hasHasuraClaims: false });
			dispatch({ type: "user", uid: "" });
		}
	}, [ token, hasHasuraClaims ]);

	const userState = _.get( state, "user" );
	const { data } = useQuery( GET_USER, { variables: { uid: userState.uid }, skip: !userState.uid || !token, fetchPolicy: "cache-and-network" });
	const user = _.omit( _.get( data, "users[0]" ), "__typename" );

	useEffect(() => {
		if ( userState.uid && !_.isEmpty( user ) && !_.isEqual( userState, user )) dispatch({ type: "user", ...user });
	}, [ userState, user ]);

	return (
		<>
			{ children && children }
		</>
	);
}
FirebaseProvider.propTypes = {
	children: PropTypes.node,
};
