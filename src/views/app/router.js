
// Packages
import React, { useContext } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";

// App
import { TopNav, BottomNav } from "../../components";
import { State, Explore, Home, Account } from "../index";

const NotFound = () => <h1>404</h1>;
const AR = () => <h1>AR</h1>;

const useStyles = makeStyles({
	root: {
		flexGrow: 1,
		display: "flex", flexDirection: "column",
	},
});

export default function Router () {
	const [ state ] = useContext( State );
	const isSmall = _.get( state, "ui.isSmall" );
	const classes = useStyles();

	const routesMap = {
		home: {
			path: "/",
			component: Home,
			exact: true,
		},
	
		map: {
			path: "/explore/:dive?",
			component: Explore,
		},
	
		ar: {
			path: "/locate",
			component: AR,
			exact: true,
		},
	
		account: {
			path: "/account",
			component: Account,
			exact: true,
		},
	
		notFound: { 
			component: NotFound,
		},
	};

	return (
		<BrowserRouter>
			{ !isSmall && <TopNav /> }
			<div className={ classes.root }>
				<Switch>
					{ _.map( routesMap, ( props, key ) => <Route key={ key } { ...props } /> )}
				</Switch>
			</div>
			{ isSmall && <BottomNav /> }
		</BrowserRouter>
	);
}

