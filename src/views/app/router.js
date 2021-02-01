
// Packages
import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import _ from "lodash";

// App


const NotFound = () => <h1>404</h1>;
const Home = () => <h1>Home</h1>;

const routesMap = {
	home: {
		path: "/",
		component: Home,
		exact: true,
	},

	notFound: { 
		component: NotFound,
	},
};

export default function Router () {


	return (
		<BrowserRouter>
			<Switch>
				{ _.map( routesMap, ({ component, props }, key ) => <Route key={ key } { ...props }>{ component && component }</Route> )}
			</Switch>
		</BrowserRouter>
	);
}

