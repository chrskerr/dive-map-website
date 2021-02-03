
// Packages
import React, { useContext } from "react";
import PropTypes from "prop-types";
import { TextField, Button, Typography } from "@material-ui/core";
import { ChevronRight, AutorenewRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import _ from "lodash";

// App
import { State } from "../";

const useStyles = makeStyles({
	fields: {
		marginBottom: "1rem",
	},
	spinner: {
		animation: "$rotation 2s infinite linear",
	},
	"@keyframes rotation": {
		from: {
			transform: "rotate(0deg)",
		},
		to: {
			transform: "rotate(359deg)",
		},
	},
});

const validationSchema = yup.object({
	username: yup
		.string( "Enter your email" )
		.email( "Enter a valid email" )
		.required( "Email is required" ),
	password: yup
		.string( "Enter a password" )
		.required( "Password is required" )
		.min( 9, "Password must be at least 9 characters long" ),
});

export default function SignIn ({ closeModal }) {
	const classes = useStyles();
	const [ state ] = useContext( State );
	const signIn = _.get( state, "auth.signIn" );

	const formik = useFormik({
		initialValues: { username: "", password: "" },
		validationSchema: validationSchema,
		onSubmit: async ( values, { setFieldError }) => {
			try {
				await signIn( _.get( values, "username" ), _.get( values, "password" ));
				if ( closeModal ) closeModal();
			} catch ( error ) {
				const code = _.get( error, "code" );
				const message = _.get( error, "message" );		
				setFieldError( _.includes( code, "password" ) ? "password" : "username", message );
			}
		},
	});

	return (
		<div>
			<Typography variant="h1">Sign In</Typography>
			<form onSubmit={ formik.handleSubmit }>
				<TextField
					className={ classes.fields }
					variant="outlined"
					autoComplete="username"
					fullWidth
					id="username"
					name="username"
					label="Email"
					type="text"
					value={ formik.values.username }
					onChange={ formik.handleChange }
					onBlur={ formik.handleBlur }
					error={ formik.touched.username && Boolean( formik.errors.username ) }
					helperText={ formik.touched.username && formik.errors.username }
				/>
				<TextField
					className={ classes.fields }
					variant="outlined"
					autoComplete="current-password"
					fullWidth
					id="password"
					name="password"
					label="Password"
					type="password"
					value={ formik.values.password }
					onChange={ formik.handleChange }
					onBlur={ formik.handleBlur }
					error={ formik.touched.password && Boolean( formik.errors.password ) }
					helperText={ formik.touched.password && formik.errors.password }
				/>
				<Button 
					color="primary" 
					variant="contained" 
					fullWidth 
					type="submit" 
					disabled={ !formik.dirty || !_.isEmpty( formik.errors ) || formik.isSubmitting }
					endIcon={ formik.isSubmitting ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRight /> }
				>
					Sign In
				</Button>
			</form>
		</div>
	);
}
SignIn.propTypes = {
	closeModal: PropTypes.func,
};