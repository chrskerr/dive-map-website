
// Packages
import React, { useReducer, useEffect, createContext } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CachePersistor, LocalForageWrapper } from "apollo3-cache-persist";
import localforage from "localforage";
import _ from "lodash";

// App
import Router from "./router";
import FirebaseProvider from "./firebase";

const initialState = {
	auth: {
		token: null,
		client: null,
		persistor: null,
		isAuthenticating: true,
		isAuthenticated: false,
		signIn: () => {},
		signOut: () => {},
	},
};

const reducer = ( state, action ) => {
	const { type, ...payload } = action;

	switch ( type ) {
	case "auth":
		return {
			...state,
			auth: {
				..._.get( state, "auth" ), 
				...payload,
			},
		};
	default: 
		return { ...state };
	}
};

export const State = createContext();

export const App = () => {
	const [ state, dispatch ] = useReducer( reducer, initialState );
	const { token, client } = _.get( state, "auth" );

	useEffect(() => {
		( async () => {
			const cache = new InMemoryCache();
			const newPersistor = new CachePersistor({
				storage: new LocalForageWrapper( localforage ),
				trigger: "write", cache,
			});
			await newPersistor.restore();
			dispatch({ 
				type: "auth", 
				persistor: newPersistor,
				client: new ApolloClient({
					uri: "https://penne-pinching.herokuapp.com/v1/graphql",
					headers: token ? { Authorization: `Bearer ${ token }` } : {},
					cache,
				}),
			});
		})();
	}, [ token ]);

	if ( !client ) return false;

	return (
		<div id="app">
			<State.Provider value={ [ state, dispatch ] }>
				<ApolloProvider client={ client }>
					<FirebaseProvider>
						<Router />
					</FirebaseProvider>
				</ApolloProvider>
			</State.Provider>
		</div>
	);
};
