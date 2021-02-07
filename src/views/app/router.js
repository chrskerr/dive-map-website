
// Packages
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";

// App
import { TopNav } from "../../components" ;
import { Home, Account } from "../index";
const Explore = React.lazy(() => import( "../explore/index" ));

const NotFound = () => <h1>404</h1>;
const AR = () => <h1>AR</h1>; // lazy load this one too

const useStyles = makeStyles({
	root: {
		flexGrow: 1,
		display: "flex", flexDirection: "column",
	},
});

export default function Router () {
	const classes = useStyles();

	const routesMap = {
		home: {
			path: "/",
			component: Home,
			exact: true,
		},
	
		map: {
			path: "/explore/:dive?/:action?",
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
			<TopNav />
			<div className={ classes.root }>
				<React.Suspense fallback={ <></> }>
					<Switch>
						{ _.map( routesMap, ( props, key ) => <Route key={ key } { ...props } /> )}
					</Switch>
				</React.Suspense>
			</div>
		</BrowserRouter>
	);
}

