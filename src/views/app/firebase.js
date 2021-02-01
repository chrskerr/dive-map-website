
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
	const { token, persistor } = _.get( state, "auth" );

	const firebaseAuth = firebase.auth();

	useEffect(() => {
		dispatch({ 
			type: "auth",
			signIn: async ( email, password ) => await firebaseAuth.signInWithEmailAndPassword( email, password ),
			createAccount: async ( email, password ) => await firebaseAuth.createUserWithEmailAndPassword( email, password ),
			signOut: () => {
				firebaseAuth.signOut();
				if ( persistor ) persistor.purge();
			},
		});

		return firebaseAuth.onAuthStateChanged( async user => {
			dispatch({ type: "auth", isAuthenticating: true });
			if ( user ) {
				const token = await user.getIdToken();
				const idTokenResult = await user.getIdTokenResult();
				const hasuraClaim = idTokenResult.claims[ "https://hasura.io/jwt/claims" ];
				if ( hasuraClaim ) {
					dispatch({ type: "auth", token });
				} else {
					dispatch({ type: "auth", token: null });
				}
			} else {
				dispatch({ type: "auth", token: null });
			}
			dispatch({ type: "auth", isAuthenticating: false });
		});
	}, []);

	useEffect(() => {
		if ( token ) dispatch({ type: "auth", isAuthenticated: true });
		else dispatch({ type: "auth", isAuthenticated: false });
	}, [ token ]);

	return (
		<>
			{ children && children }
		</>
	);
}
FirebaseProvider.propTypes = {
	children: PropTypes.node,
};
