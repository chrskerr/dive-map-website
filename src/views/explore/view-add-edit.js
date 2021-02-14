
// Packages
import React, { useEffect, useContext, useState } from "react";
import { TextField, Button, Grid, Typography, Select, MenuItem, FormControl, InputLabel, Tooltip } from "@material-ui/core";
import { ChevronRightRounded, AutorenewRounded, AddRounded, ChevronLeftRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import * as yup from "yup";
import _ from "lodash";
import { gql, useMutation } from "@apollo/client";
import { useHistory, useParams } from "react-router-dom";

// App
import { State } from "../";

const useStyles = makeStyles( theme => ({
	gridContainer: {
		marginBottom: theme.spacing( 3 ),
	},
	field: {
		"& .Mui-disabled": {
			color: "initial",
		},
	},
	markerText: {
		fontSize: "85%",
	},
	deleteMarkerText: {
		fontSize: "85%",
		cursor: "pointer",
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

const INSERT_DIVE_REVISION = gql`
	mutation( $id: String!, $changes: JSON!, $dive: JSON! ) {
		create_dive_revision( id: $id, changes: $changes, dive: $dive )
	}
`;

export default function ViewAddEdit () {
	const classes = useStyles();
	const history = useHistory();
	const { dive: diveId } = useParams();

	const [ state, dispatch ] = useContext( State );
	const [ isTooltipOpen, setIsTooltipOpen ] = useState( false );
	const { isAuthenticated } = _.get( state, "auth" );
	const { id } = _.get( state, "user" );

	const [ insertDiveRevision ] = useMutation( INSERT_DIVE_REVISION, { refetchQueries: [ "GetAllDives" ], awaitRefetchQueries: true }); 

	const dive = _.get( state, "explore.dive" );
	const { coords, name, description, dive_plan, depth, type, requestingMarkerType } = dive;
	const coordsEdited = _.get( state, "explore.coordsEdited" );

	const view = _.get( state, "explore.view" );
	const fieldVariant = view === "viewOne" ? "standard" : "outlined";
	const mainCoords = _.head( _.get( coords, "main" ));

	const formik = useFormik({
		initialValues: view === "add" ? 
			{ name: "", description: "", dive_plan: "", depth: 0, type: "route" } :
			{ name, description, dive_plan, depth, type },
		validationSchema: validationSchema,
		enableReinitialize: true,
		onSubmit: async ( data, { setFieldError }) => {
			try {
				if ( _.isEmpty( mainCoords )) throw Error({ message: "At least one waypoint must be selected" });

				const id = diveId === "add" ? "" : diveId || `${ _.get( mainCoords, "lat" ) }-${ _.get( mainCoords, "lng" ) }-${ _.kebabCase( _.get( values, "name" )) }`;

				const values = { ...data, coords };
				const changes = view === "add" ? values : _.reduce( values, ( curr, val, key ) => {
					return val !== _.get( dive, key ) ? { ...curr, [ key ]: val } : curr;
				}, {});

				await insertDiveRevision({ variables: { id, changes, dive: _.pick( dive, [ "name", "depth", "description", "dive_plan", "type", "coords" ]) }});
				
				_return();
			} catch ( error ) {
				console.error( error );
				const code = _.get( error, "code" );
				const message = _.get( error, "message" );		
				setFieldError( _.includes( code, "password" ) ? "password" : "username", message );
			}
		},
	});

	const _return = () => {
		if ( view === "edit" ) history.push( `/explore/${ diveId }` );
		else history.push( "/explore" );

		formik.resetForm();
	};

	const _edit = () => {
		if ( view === "viewOne" ) {
			if ( isAuthenticated ) history.push( `/explore/${ diveId }/edit` );
			else setIsTooltipOpen( e => !e );
		}
	};

	useEffect(() => {
		if (( view === "add" || view === "edit" ) && !_.isEqual( formik.values.type, type ) && formik.values.type ) {
			dispatch({ type: "explore.updateDive", dive: { type: formik.values.type }});
		}
	}, [ formik.values.type, type, view  ]);
	
	if (( !id || !isAuthenticated ) && view !== "viewOne" ) return <p>You must be logged in to { view } a dive.</p>;

	return (
		<form onSubmit={ formik.handleSubmit }>
			<Grid container spacing={ 3 } className={ classes.gridContainer }>
				<Grid item xs={ 6 }>
					<Button variant="outlined" fullWidth size="small" startIcon={ <ChevronLeftRounded /> } onClick={ _return }>{ view === "viewOne" ? "Return" : "Cancel" }</Button>
				</Grid>
				<Grid item xs={ 6 }>
					{ view === "viewOne" && 
						<Tooltip open={ isTooltipOpen } placement="left" arrow title="You must be logged in to do this">
							<Button variant="outlined" fullWidth size="small" onClick={ _edit }>Edit</Button>
						</Tooltip>
					}
				</Grid>
				<Grid item xs={ 12 }>
					<TextField
						className={ classes.field }
						variant={ fieldVariant }
						disabled={ view === "viewOne" }
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
						className={ classes.field }
						variant={ fieldVariant }
						disabled={ view === "viewOne" }
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
					<FormControl className={ classes.field } variant={ fieldVariant } fullWidth size="small">
						<InputLabel id="select-dive-site-type-label">Type of dive site</InputLabel>
						<Select
							id="type"
							name="type"
							disabled={ view === "viewOne" } 
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
						className={ classes.field }
						variant={ fieldVariant }
						disabled={ view === "viewOne" }
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
						className={ classes.field }
						variant={ fieldVariant }
						disabled={ view === "viewOne" }
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

				{ ( view === "edit" || view === "add" ) && <>
					{ _.map([ "journey", "main" ], type => {
						return ( 
							<Grid item xs={ 6 } key={ type }>
								<Tooltip 
									open={ requestingMarkerType === type }
									title="Double click the map to drop a new pin. This can then be dragged to accurately position."
								>
									<Button
										variant="contained"
										size="small"
										endIcon={ <AddRounded /> }
										onClick={ () => {
											const func = ({ lat, lng }) => dispatch({ type: "addEdit.updateCoords", coordType: type, latLng: { lat, lng }});
											dispatch({ type: "addEdit.requestMarker", func, requestingMarkerType: type });
										}}
										disabled={ _.isFunction( _.get( state, "explore.map.requestFunc" )) }
									>
										{ type === "main" && <>{ formik.values.type === "area" ? "Add a new boundary marker" : "Add a new route marker" }</> }
										{ type === "journey" && "Add a new journey waypoint" }
									</Button>
								</Tooltip>
							</Grid>
						);
					})}

					<Grid item xs={ 12 }>
						<Typography>Markers can be dragged to move, and double-clicked to delete on the map.</Typography>
					</Grid>

					{/* Save / Cancel Buttons */}
					<Grid item xs={ 6 }>
						<Button 
							color="primary" 
							variant="contained" 
							fullWidth 
							size="small"
							type="submit" 
							disabled={ coordsEdited ? false : !formik.dirty || !_.isEmpty( formik.errors ) || formik.isSubmitting || _.isEmpty( mainCoords ) }
							endIcon={ formik.isSubmitting ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRightRounded /> }
						>Save</Button>
					</Grid>
				</> }
			</Grid>
		</form>
	);
}
