
// Packages
import React from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { HomeRounded, CameraAltRounded, AssignmentIndRounded, ExploreRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";



const useStyles = makeStyles({
	root: {
		flexGrow: 0,
	},
});

export default function BottomNav () {
	const history = useHistory();
	const location = useLocation();
	const classes = useStyles();

	const value = `/${ _.nth( _.split( _.get( location, "pathname" ), "/" ), 1 ) }`;

	return (
		<div className={ classes.root }>
			<BottomNavigation value={ value } onChange={ ( e , val ) => history.push( val ) }>
				<BottomNavigationAction label="Home" value="/" icon={ <HomeRounded /> } />
				<BottomNavigationAction label="Map" value="/explore" icon={ <ExploreRounded /> } />
				<BottomNavigationAction label="AR" value="/locate" icon={ <CameraAltRounded /> } />
				<BottomNavigationAction label="User" value="/account" icon={ <AssignmentIndRounded /> } />
			</BottomNavigation> 
		</div>
	);
}
