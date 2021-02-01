
// Packages
import React, { useReducer, useEffect, createContext } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CachePersistor, LocalForageWrapper } from "apollo3-cache-persist";
import localforage from "localforage";
import _ from "lodash";

// App
import Router from "./router";
import FirebaseProvider from "./firebase";
import reducer from "./reducer";
import initialState from "./initialState";


export const State = createContext();

export const App = () => {
	const [ state, dispatch ] = useReducer( reducer, initialState );
	const { token, client } = _.get( state, "auth" );
	const breakpoint = _.get( state, "ui.breakpoint" );

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
					uri: process.env.REACT_APP_HASURA_URL,
					headers: token ? { Authorization: `Bearer ${ token }` } : {},
					cache,
				}),
			});
		})();
	}, [ token ]);

	const _setBreakpoint = () => {
		const innerWidth = _.get( window, "innerWidth" );
		let newBreakpoint;

		if ( innerWidth >= 1920 ) newBreakpoint = "xl";
		else if ( innerWidth >= 1280 ) newBreakpoint = "lg";
		else if ( innerWidth >= 960 ) newBreakpoint = "md";
		else if ( innerWidth >= 600 ) newBreakpoint = "sm";
		else newBreakpoint = "xs";

		if ( breakpoint !== newBreakpoint ) dispatch({ type: "ui", breakpoint: newBreakpoint });
	};

	useEffect(() => {
		window.addEventListener( "resize", _setBreakpoint );
	}, []);

	useEffect(() => {
		if ( !breakpoint ) _setBreakpoint();
	}, [ breakpoint ]);

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
