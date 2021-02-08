
// Packages
import React, { useContext } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Grid, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { ChevronLeftRounded } from "@material-ui/icons";
import { parseISO, format } from "date-fns";
import { useHistory } from "react-router-dom";

// App
import { State } from "../";

const useStyles = makeStyles({
	title: {
		fontSize: "90%",
	},
	text: {
		fontWeight: "bold",
	},
	button: {
		textAlign: "right",
	},
});

export default function One () {
	const classes = useStyles();
	const history = useHistory();
	const [ state ] = useContext( State );
	const diveData = _.get( state, "explore.dive" );

	if ( !_.get( diveData, "id" )) return null;

	return (
		<Grid container spacing={ 3 }>
			<Grid item xs={ 6 }>
				<Typography variant="h4">Viewing Dive</Typography>
			</Grid>
			<Grid item xs={ 6 } className={ classes.button }>
				<Button variant="outlined" size="small" startIcon={ <ChevronLeftRounded /> } onClick={ () => history.push( "/explore" ) }>Return</Button>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Name:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "name" ) }</Typography>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Depth:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "depth" ) } metres</Typography>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Description:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "description" ) }</Typography>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Dive Plan:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "dive_plan" ) }</Typography>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Created At:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "created_at" ) && format( parseISO( _.get( diveData, "created_at" )), "h:mm a d MMM yyyy" ) }</Typography>
			</Grid>
			<Grid item xs={ 4 }>
				<Typography className={ classes.title }>Last Updated:</Typography>
			</Grid>
			<Grid item xs={ 8 }>
				<Typography className={ classes.text }>{ _.get( diveData, "updated_at" ) && format( parseISO( _.get( diveData, "updated_at" )), "h:mm a d MMM yyyy" ) }</Typography>
			</Grid>
		</Grid>
	);

}
One.propTypes = {
	reducerBag: PropTypes.array,
};
