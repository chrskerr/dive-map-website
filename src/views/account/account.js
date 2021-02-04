
// Packages
import React, { useContext } from "react";
import _ from "lodash";
import { Button, Container } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";

// App
import { State } from "../";
import { AuthComponent } from "../../components";


export default function Account () {
	const [ state ] = useContext( State );
	const { isAuthenticating, isAuthenticated, signOut } = _.get( state, "auth" );

	if ( isAuthenticating ) return <p>Authenticating...</p>;

	return isAuthenticated ? 
		(
			<Button variant="outlined" onClick={ signOut }>Sign Out</Button>
		)
		:
		(
			<Container maxWidth="sm">
				<AuthComponent />
			</Container>
		)
	;
}
