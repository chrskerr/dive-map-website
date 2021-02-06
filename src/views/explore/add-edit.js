
// Packages
import React, { useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { TextField, Button, Grid, Typography, Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import { ChevronRightRounded, AutorenewRounded, AddRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import _ from "lodash";
import { gql, useMutation } from "@apollo/client";

// App
import { State } from "../";

const useStyles = makeStyles( theme => ({
	gridContainer: {
		marginBottom: theme.spacing( 3 ),
	},
	markerText: {
		fontSize: "85%",
	},
	deleteMarkerText: {
		fontSize: "85%",
		cursor: "pointer",
	},
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
	dive_plan: yup
		.string( "Enter a dive plan" )
		.required( "Dive plan is required" ),
	type: yup
		.string( "Enter a dive site type" )
		.required( "Dive site type is required" ),
});

const INSERT_DIVE = gql`
	mutation( $object: dives_insert_input! ) {
		insert_dives_one( object: $object ) {
			id
		}
	}
`;

export default function AddEdit ({ reducerBag, editing = false }) {
	const classes = useStyles();
	
	const [ appState ] = useContext( State );
	const { isAuthenticated } = _.get( appState, "auth" );
	const { id } = _.get( appState, "user" );

	const [ insertDive ] = useMutation( INSERT_DIVE, { refetchQueries: [ "GetAllDives" ], awaitRefetchQueries: true }); 

	const [ state, dispatch ] = reducerBag;
	const coords = _.get( state, "addEdit.coords" );
	const savedDiveType = _.get( state, "addEdit.diveType" );

	const mainCoords = _.get( coords, "main" );

	const formik = useFormik({
		initialValues: { name: "", description: "", dive_plan: "", depth: 0, type: "route" },
		validationSchema: validationSchema,
		onSubmit: async ( values, { setFieldError }) => {
			try {
				if ( _.isEmpty( mainCoords )) throw Error({ message: "At least one waypoint must be selected" });

				await insertDive({ variables: {
					object: {
						...values,
						id: `${ _.get( _.head( mainCoords ), "lat" ) }-${ _.get( _.head( mainCoords ), "lat" ) }-${ _.kebabCase( _.get( values, "name" )) }`, 
						coords,
						revisions: {
							data: {
								changes: { ...values, coords }, 
								_owner: id,
							},
						},
					},
				}});

				dispatch({ type: "lgView.viewAll" });
			} catch ( error ) {
				console.error( error );
				const code = _.get( error, "code" );
				const message = _.get( error, "message" );		
				setFieldError( _.includes( code, "password" ) ? "password" : "username", message );
			}
		},
	});

	console.log( editing );
	
	useEffect(() => {
		if ( !_.isEqual( formik.values.type, savedDiveType )) dispatch({ type: "addEdit.updateDiveType", diveType: formik.values.type });
	}, [ formik.values.type, savedDiveType ]);
	
	if ( !id || !isAuthenticated ) return <p>You must be logged in to add a dive.</p>;

	return (
		<form onSubmit={ formik.handleSubmit }>
			<Grid container spacing={ 3 } className={ classes.gridContainer }>
				<Grid item xs={ 12 }>
					<Typography variant="h4">Add A New Dive</Typography>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						variant="outlined"
						fullWidth
						size="small"
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
						size="small"
						id="depth"
						name="depth"
						label="Average Depth (m)"
						type="number"
						value={ formik.values.depth }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.depth && Boolean( formik.errors.depth ) }
						helperText={ formik.touched.depth && formik.errors.depth }
					/>
				</Grid>
				<Grid item xs={ 6 }>
					<FormControl variant="outlined" fullWidth size="small">
						<InputLabel id="select-dive-site-type-label">Type of dive site</InputLabel>
						<Select
							id="type"
							name="type"
							label="Type of dive site"
							labelId="select-dive-site-type-label"
							value={ formik.values.type }
							onChange={ formik.handleChange }
							onBlur={ formik.handleBlur }
						>
							<MenuItem value="route">Route</MenuItem>
							<MenuItem value="area">Area</MenuItem>
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						variant="outlined"
						fullWidth
						multiline
						size="small"
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
						size="small"
						id="dive_plan"
						name="dive_plan"
						label="Outline the dive plan"
						type="text"
						value={ formik.values.dive_plan }
						onChange={ formik.handleChange }
						onBlur={ formik.handleBlur }
						error={ formik.touched.dive_plan && Boolean( formik.errors.dive_plan ) }
						helperText={ formik.touched.dive_plan && formik.errors.dive_plan }
					/>
				</Grid>
			</Grid>

			{/* Add Marker Buttons */}
			<Grid container spacing={ 1 }>
				{ _.map([ "journey", "main" ], type => {
					const coords = _.get( state, `addEdit.coords.${ type }` );
					return( 
						<Grid item xs={ 6 } key={ type }>
							<Grid container spacing={ 1 } className={ classes.gridContainer }>
								<Grid item xs={ 12 }>
									<Button
										variant="contained"
										size="small"
										endIcon={ <AddRounded /> }
										onClick={ () => {
											const func = ({ lat, lng }) => dispatch({ type: "addEdit.updateCoords", coordType: type, latLng: { lat, lng }});
											dispatch({ type: "addEdit.requestMarker", func });
										}}
										disabled={ state.addEdit.isRequesting }
									>
										{ type === "main" && <>{ formik.values.type === "area" ? "Add a new boundary marker" : "Add a new route marker" }</> }
										{ type === "journey" && "Add a new journey waypoint" }
									</Button>
								</Grid>
								{ !_.isEmpty( coords ) && _.map( coords, ( coords, index ) => {
									return (
										<Grid item xs={ 12 } key={ index }>
											<Grid container> 
												<Grid item xs={ 4 }>
													<Typography className={ classes.markerText }>#{ index + 1 }</Typography>
												</Grid>
												<Grid item xs={ 8 }>
													<Typography color="secondary" className={ classes.deleteMarkerText } onClick={ () => dispatch({ type: "addEdit.deleteCoord", coordType: "main", index }) }>Delete</Typography>
												</Grid>
											</Grid>
										</Grid>
									);
								})}
							</Grid>
						</Grid>
					);
				})}
			</Grid> 

			{/* Save / Cancel Buttons */}
			<Grid container spacing={ 3 } className={ classes.gridContainer }>
				<Grid item xs={ 8 }>
					<Button 
						color="primary" 
						variant="contained" 
						fullWidth 
						size="small"
						type="submit" 
						disabled={ !formik.dirty || !_.isEmpty( formik.errors ) || formik.isSubmitting || _.isEmpty( mainCoords ) }
						endIcon={ formik.isSubmitting ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRightRounded /> }
					>Save</Button>
				</Grid>
				<Grid item xs={ 4 }>
					<Button fullWidth variant='contained' size="small" color="secondary" onClick={ () => { 
						formik.resetForm();
						dispatch({ type: "lgView.viewAll" });
					}}>Cancel</Button>
				</Grid>
			</Grid>
		</form>
	);
}
AddEdit.propTypes = {
	reducerBag: PropTypes.array,
	editing: PropTypes.bool,
};