
// Packages
import React, { useEffect } from "react";
// import { Modal, Paper } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";

// App

// const useStyles = makeStyles({

// });

let zxcvbn;

export default function SignIn () {
	useEffect(() => {
		if ( !zxcvbn ) import( "zxcvbn" ).then( z => zxcvbn = z );
	}, [ zxcvbn ]);
	// const classes = useStyles();


	console.log( zxcvbn );

	return (
		<p>Sign In</p>
	);
}
