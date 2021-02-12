
// Packages
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Button, Paper, Typography, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Tooltip } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

// App
import { State } from "../";

const useStyles = makeStyles( theme => ({
	listItem: {
		marginBottom: theme.spacing( 2 ),
		"& .MuiPaper-root": {
			padding: theme.spacing( 1 ),
			cursor: "pointer",
			"& .MuiTypography-root": {
				fontSize: "85%",
			},
		},
	},
}));


export default function DivesList ({ dives }) {
	const classes = useStyles();

	const history = useHistory();
	const [ state, dispatch ] = useContext( State );
	const [ isTooltipOpen, setIsTooltipOpen ] = useState( false );

	const markerPositionType = _.get( state, "explore.map.markerPositionType" );
	const isAuthenticated = _.get( state, "auth.isAuthenticated" );

	return <>
		<div>
			<Paper className={ classes.paper }>
				<FormControl component="fieldset">
					<FormLabel className={ classes.label } component="legend">Where should the markers be displayed?</FormLabel>
					<RadioGroup aria-label="marker position" name="Marker Position Type" value={ markerPositionType } onChange={ e => dispatch({ type: "map.setMarkerPositionType", markerPositionType: e.target.value })}>
						<FormControlLabel className={ classes.controlLabel } value="journey" control={ <Radio color="primary" /> } label="Departure point" />
						<FormControlLabel className={ classes.controlLabel } value="main" control={ <Radio color="primary" /> } label="Descent point" />
					</RadioGroup>
				</FormControl>
			</Paper>
		</div>
		<div className={ classes.listItem }>
			<Tooltip open={ isTooltipOpen } arrow placement='top' title="You must be logged in to do this">
				<Button 
					variant='outlined' size="small" fullWidth endIcon={ <AddRounded /> } 
					onClick={ () => isAuthenticated ? history.push( "/explore/add" ) : setIsTooltipOpen( e => !e ) }
				>Add a New Dive</Button>
			</Tooltip>
		</div>
		{ !_.isEmpty( dives ) && _.map( dives, site => {
			const { id, name, depth } = site;
			return <div className={ classes.listItem } key={ id }>
				<Paper onClick={ () => history.push( `/explore/${ id }` ) }>
					<Typography>{ name }</Typography>
					<Typography>Depth: { depth } metres</Typography>
				</Paper>
			</div>;
		})}
	</>;
}
DivesList.propTypes = {
	dives: PropTypes.array,
};
