
// Packages
import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import "firebase/auth";
import _ from "lodash";


// App
import { State } from "../index";

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

				const getClaims = ( loop = 0 ) => {
					if ( loop === 30 ) return;
					return new Promise( resolve => setTimeout( async () => {
						await user.getIdToken( true );
						const idTokenResult = await user.getIdTokenResult();
						const hasuraClaims = idTokenResult.claims[ "https://hasura.io/jwt/claims" ];
						return hasuraClaims ? resolve() : await getClaims( loop + 1 );
					}, 200 ));
				};

				return await getClaims();
			},
			signOut: () => {
				firebaseAuth.signOut();
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

				const idTokenResult = await user.getIdTokenResult();
				const hasuraClaim = idTokenResult.claims[ "https://hasura.io/jwt/claims" ];
				
				if ( hasuraClaim ) dispatch({ type: "auth", hasHasuraClaims: true, isAuthenticated: true, isAuthenticating: false });
				else dispatch({ type: "auth", hasHasuraClaims: false, isAuthenticated: false });
			}
			else dispatch({ type: "auth", token: null, isAuthenticating: false, isAuthenticated: false });
		});
	}, []);

	useEffect(() => {
		if ( token && currentFirebaseUser ) {
			if ( hasHasuraClaims ) dispatch({ type: "auth", isAuthenticated: true, isAuthenticating: false });
			else setTimeout(() => currentFirebaseUser.getIdToken( true ), 500 );
		}
		else dispatch({ type: "auth", isAuthenticated: false, isAuthenticating: false, hasHasuraClaims: false });
	}, [ token, hasHasuraClaims ]);

	return (
		<>
			{ children && children }
		</>
	);
}
FirebaseProvider.propTypes = {
	children: PropTypes.node,
};
