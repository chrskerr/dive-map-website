
// Packages
import React, { useContext } from "react";
import _ from "lodash";
// import { makeStyles } from "@material-ui/core/styles";

// App
import { State } from "../";

// const useStyles = makeStyles({
// 	root: {
// 		maxWidth: "100vw", maxHeight: "100vh",
// 		width: "100vw", height: "100vh",
// 		display: "flex", flexDirection: "column",
// 	},
// });


export default function ExploreAdd () {
	const [ state ] = useContext( State );
	const { isAuthenticating, isAuthenticated } = _.get( state, "auth" );
	console.log( isAuthenticating, isAuthenticated );

	return <p>Add New Dive</p>;
}
