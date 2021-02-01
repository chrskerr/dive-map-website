
// Packages
import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import firebase from "firebase/app";
import "firebase/auth";
import _ from "lodash";


// App
import { State } from "../index";

const firebaseConfig = {
	apiKey: "AIzaSyB2Qvk47TBGk4H2f5naN_V378yW4qC5t_k",
	authDomain: "dive-map-36d7c.firebaseapp.com",
	projectId: "dive-map-36d7c",
	storageBucket: "dive-map-36d7c.appspot.com",
	messagingSenderId: "881441871258",
	appId: "1:881441871258:web:37b4b7727f40be925f9623",
};

firebase.initializeApp( firebaseConfig );

export default function FirebaseProvider ({ children }) {
	const [ state, dispatch ] = useContext( State );
	const { token, persistor } = _.get( state, "auth" );

	useEffect(() => {
		dispatch({ 
			type: "auth",
			signIn: async ( email, password ) => await firebase.auth().signInWithEmailAndPassword( email, password ),
			signOut: () => {
				firebase.auth().signOut();
				if ( persistor ) persistor.purge();
			},
		});

		return firebase.auth().onAuthStateChanged( async user => {
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
