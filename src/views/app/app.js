
// Packages
import React, { useState, useReducer, useEffect, createContext } from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { CachePersistor, LocalForageWrapper } from "apollo3-cache-persist";
import localforage from "localforage";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import useMobileDetect from "use-mobile-detect-hook";

// App
import Router from "./router";
import FirebaseProvider from "./firebase";
import reducer from "./reducer";
import initialState from "./initial-state";
import Theme from "./theme";

const useStyles = makeStyles({
	root: {
		maxWidth: "100vw", maxHeight: ({ viewHeight }) => viewHeight,
		width: "100vw", height: ({ viewHeight }) => viewHeight,
		display: "flex", flexDirection: "column",
	},
});

export const State = createContext();

export const App = () => {
	const [ state, dispatch ] = useReducer( reducer, initialState );
	const { token, client, isAuthenticated } = _.get( state, "auth" );
	const { breakpoint, viewHeight } = _.get( state, "ui" );
	const classes = useStyles({ viewHeight });

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
					headers: isAuthenticated ? { Authorization: `Bearer ${ token }` } : {},
					cache,
				}),
			});
		})();
	}, [ token, isAuthenticated ]);

	const _setBreakpoint = _.debounce(() => {
		const innerWidth = _.get( window, "innerWidth" );
		const newViewHeight = _.get( window, "innerHeight" );
		let newBreakpoint, isSmall;

		if ( innerWidth >= 1920 ) newBreakpoint = "xl", isSmall = false;
		else if ( innerWidth >= 1280 ) newBreakpoint = "lg", isSmall = false;
		else if ( innerWidth >= 960 ) newBreakpoint = "md", isSmall = false;
		else if ( innerWidth >= 600 ) newBreakpoint = "sm", isSmall = true;
		else newBreakpoint = "xs", isSmall = true;

		if ( breakpoint !== newBreakpoint || viewHeight !== newViewHeight ) dispatch({ type: "ui", breakpoint: newBreakpoint, isSmall, viewHeight: newViewHeight });
	}, 100 );

	useEffect(() => {
		window.addEventListener( "resize", _setBreakpoint );
		return () => window.removeEventListener( "resize" );
	}, []);

	useEffect(() => {
		if ( !breakpoint || !viewHeight ) _setBreakpoint();
	}, [ breakpoint ]);

	const [ styleEl, setStyleEl ] = useState( false );
	useEffect(() => {
		let el = styleEl;
		if ( !el ) {
			el = document.createElement( "style" );
			document.body.appendChild( el );
			setStyleEl( el );
		}
		el.innerHTML = `body { height: ${ viewHeight }px !important }`;
	}, [ viewHeight ]);

		
	const detectMobile = useMobileDetect();
	const deviceType = {
		isDesktop: detectMobile.isDesktop(),
		isMobile: detectMobile.isMobile(),
		isIos: detectMobile.isIos(),
		isDesktAndroid: detectMobile.isAndroid(),
	};
	useEffect(() => {
		if ( !_.isEqual( deviceType, state.ui.deviceType )) dispatch({ type: "ui", deviceType });
	}, [ deviceType ]);

	if ( !client ) return false;

	return (
		<div id="app" className={ classes.root }>
			<State.Provider value={ [ state, dispatch ] }>
				<ApolloProvider client={ client }>
					<FirebaseProvider>
						<Theme>
							<Router />
						</Theme>
					</FirebaseProvider>
				</ApolloProvider>
			</State.Provider>
		</div>
	);
};
