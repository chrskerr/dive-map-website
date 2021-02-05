
// Packages
import React from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid, Typography } from "@material-ui/core";
import { ChevronRight, AutorenewRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import _ from "lodash";

// App

const useStyles = makeStyles( theme => ({
	fields: {
		marginBottom: theme.spacing( 2 ),
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
}));

const validationSchema = yup.object({
	name: yup
		.string( "Enter a name" )
		.required( "Name is required" ),
	depth: yup
		.number( "Enter a depth" )
		.moreThan( 0, "Depth must be above zero" )
		.required( "Depth is required" ),
	description: yup
		.string( "Enter a description" )
		.required( "Descripttion is required" ),
	divePlan: yup
		.string( "Enter a dive plan" )
		.required( "Dive plan is required" ),
});

export default function Add ({ cancel }) {
	const classes = useStyles();

	const formik = useFormik({
		initialValues: { name: "", description: "", divePlan: "", depth: 0 },
		validationSchema: validationSchema,
		onSubmit: async ( values, { setFieldError }) => {
			try {
				console.log( values );
				if ( cancel ) cancel();
			} catch ( error ) {
				const code = _.get( error, "code" );
				const message = _.get( error, "message" );		
				setFieldError( _.includes( code, "password" ) ? "password" : "username", message );
			}
		},
	});

	return (
		<form onSubmit={ formik.handleSubmit }>
			<Grid container spacing={ 3 }>
				<Grid item xs={ 12 }>
					<Typography variant="h4">Add A New Dive</Typography>
				</Grid>
				<Grid item xs={ 6 }>
					<TextField
						variant="outlined"
						fullWidth
						id="name"
						name="name"
						label="Name"
						type="text"
						value={ formik.values.name }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.name && Boolean( formik.errors.name ) }
						helperText={ formik.touched.name && formik.errors.name }
					/>
				</Grid>
				<Grid item xs={ 6 }>
					<TextField
						variant="outlined"
						fullWidth
						id="depth"
						name="depth"
						label="Average Depth"
						type="number"
						value={ formik.values.depth }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.depth && Boolean( formik.errors.depth ) }
						helperText={ formik.touched.depth && formik.errors.depth }
					/>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						variant="outlined"
						fullWidth
						multiline
						id="description"
						name="description"
						label="Describe the dive"
						type="text"
						value={ formik.values.description }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.description && Boolean( formik.errors.description ) }
						helperText={ formik.touched.description && formik.errors.description }
					/>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						variant="outlined"
						fullWidth
						multiline
						id="divePlan"
						name="divePlan"
						label="Outline the dive plan"
						type="text"
						value={ formik.values.divePlan }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.divePlan && Boolean( formik.errors.divePlan ) }
						helperText={ formik.touched.divePlan && formik.errors.divePlan }
					/>
				</Grid>
				<Grid item xs={ 12 }>
					<Button 
						color="primary" 
						variant="contained" 
						fullWidth 
						type="submit" 
						disabled={ !formik.dirty || !_.isEmpty( formik.errors ) || formik.isSubmitting }
						endIcon={ formik.isSubmitting ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRight /> }
					>Save</Button>
				</Grid>
				<Grid item xs={ 12 }>
					<Button fullWidth variant='contained' size="small" color="secondary" onClick={ () => { 
						formik.resetForm();
						cancel();
					}}>Cancel</Button>
				</Grid>
			</Grid>
		</form>
	);
}
Add.propTypes = {
	cancel: PropTypes.func,
};