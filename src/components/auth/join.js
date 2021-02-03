
// Packages
import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
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

let zxcvbn;

const validationSchema = yup.object({
	username: yup
		.string( "Enter your email" )
		.email( "Enter a valid email" )
		.required( "Email is required" ),
	password: yup
		.string( "Enter a password" )
		.required( "Password is required" )
		.min( 9, "Password must be at least 9 characters long" )
		.test( "is-strong-password", "${ path }", ( value, context ) => {
			const { path, createError } = context;		

			if ( !value ) return createError({ path, message: "Password is required" });
			if ( !_.isFunction( zxcvbn )) return true;

			const { score, feedback } = zxcvbn( value );
			const message = _.get( feedback, "warning" ) || _.get( feedback, "suggestions[0]" ) || "Password is too simple";

			return score < 2 ? createError({ path, message }) : true; 
		}),
});

export default function Join ({ closeModal }) {
	const classes = useStyles();
	const [ state ] = useContext( State );
	const createAccount = _.get( state, "auth.createAccount" );

	useEffect(() => {
		if ( !zxcvbn ) import( "zxcvbn" ).then( z => zxcvbn = z.default );
	}, [ zxcvbn ]);

	const formik = useFormik({
		initialValues: { username: "", password: "" },
		validationSchema: validationSchema,
		onSubmit: async ( values, { setFieldError }) => {
			try {
				await createAccount( _.get( values, "username" ), _.get( values, "password" ));
				if ( closeModal ) closeModal();
			} catch ( error ) {
				const code = _.get( error, "code" );
				const message = _.get( error, "message" );		
				setFieldError( _.includes( code, "email" ) ? "username" : "password", message );
			}
		},
	});

	return (
		<div>
			<form onSubmit={ formik.handleSubmit }>
				<TextField
					className={ classes.fields }
					variant="outlined"
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
					autoComplete="new-password"
					fullWidth
					id="password"
					name="password"
					label="Password"
					type="password"
					value={ formik.values.password }
					onChange={ e => {
						formik.handleChange( e ); 
						formik.setTouched({ "password": true });
					}}
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
					Create Account
				</Button>
			</form>
		</div>
	);
}
Join.propTypes = {
	closeModal: PropTypes.func,
};