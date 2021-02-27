
// Packages
import React from "react";
import { BrowserRouter, Switch, Route, useLocation } from "react-router-dom";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";

// App
import { TopNav } from "../../components" ;
import { Home, Account } from "../index";
const Explore = React.lazy(() => import( "../explore/index" ));
const AR = React.lazy(() => import( "../ar/ar" ));

const NotFound = () => <h1>404</h1>;

const useStyles = makeStyles({
	root: {
		flexGrow: 1,
		display: "flex", flexDirection: "column",
		overflow: props => props.path === "/" ? "scroll" : "hidden",
	},
});

export default function RouterContainer () {
	return (
		<BrowserRouter>
			<Router />
		</BrowserRouter>
	);
}

const Router = () => {
	const location = useLocation();
	const classes = useStyles({ path: _.get( location, "pathname" ) });

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

	return ( <>
		<TopNav />
		<div className={ classes.root }>
			<React.Suspense fallback={ <></> }>
				<Switch>
					{ _.map( routesMap, ( props, key ) => <Route key={ key } { ...props } /> )}
				</Switch>
			</React.Suspense>
		</div>
	</> );
};
