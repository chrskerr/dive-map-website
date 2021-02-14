
// Packages
import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { useSpring, animated as a, config } from "react-spring";
import { Tooltip, IconButton } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

// App
import { State } from "../";
import Map from "./map";
import ViewAddEdit from "./view-add-edit";
import DivesList from "./dive-list";

const useStyles = makeStyles( theme => ({
	root: {
		flexGrow: 1,
		position: "relative",
	},
	container: {
		position: "absolute",
		borderRight: `${ theme.palette.grey[ "600" ] } inset 1px`,
	},
	content: {
		padding: theme.spacing( 2 ),
		overflowY: "scroll",
		overflowX: "hidden",
		height: "100%",
	},
	addButton: {
		position: "absolute",
		bottom: theme.spacing( 3 ),
		right: theme.spacing( 2 ),
		zIndex: 1000,
		backgroundColor: theme.palette.common.white,
		borderRadius: theme.spacing( 0.5 ),
		borderStyle: "solid",
		borderWidth: 1.8,
		borderColor: theme.palette.grey[ 400 ],
		padding: theme.spacing( 0.5 ),
		"& .MuiSvgIcon-root": {
			fontSize: "90%",
		},
	},
}));

export default function Explore ({ dives }) {
	const classes = useStyles();
	const history = useHistory();
	const [ isTooltipOpen, setIsTooltipOpen ] = useState( false );
	
	const [ state ] = useContext( State );
	const view = _.get( state, "explore.view" );
	const map = _.get( state, "explore.map.map" );
	const size = _.get( state, "ui.isSmall" ) ? "small" : "large"; 
	const isAuthenticated = _.get( state, "auth.isAuthenticated" );

	const paneOneProps = useSpring({ 
		...getProps( size, view, "one" ),
		onFrame: map ? _.throttle(() => map.invalidateSize(), 20 ) : () => {},
		config: config.default,
	});
	const paneTwoProps = useSpring({ 
		...getProps( size, view, "two" ),
		config: config.default,
	});
	const paneThreAddProps = useSpring({ 
		...getProps( size, view, "three" ),
		config: config.default,
	});

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ paneOneProps }>
				<Map allDives={ dives } />
			</a.div>
			<a.div className={ classes.container } style={ paneTwoProps }>
				<div className={ classes.content }>
					{ view === "viewAll" ? <DivesList dives={ dives } /> : <ViewAddEdit /> }
				</div>
			</a.div>
			<a.div className={ classes.container } style={ paneThreAddProps }>
				<div className={ classes.content }>
					{ view === "edit" ? <p>Edit a dive</p> : <p>View dive edit history</p> }
				</div>
			</a.div>
			{ ( size ==="small" && view === "viewAll" ) && <div className={ classes.addButton }>
				<Tooltip open={ isTooltipOpen } arrow placement='top' title="You must be logged in to do this">
					<IconButton 
						variant='outlined' size="small" aria-label="add new dive"
						onClick={ () => isAuthenticated ? history.push( "/explore/add" ) : setIsTooltipOpen( e => !e ) }
					>
						<AddRounded />
					</IconButton>
				</Tooltip>
			</div> }
		</div>
	</> );
}
Explore.propTypes = {
	dives: PropTypes.array,
};

const getProps = ( size, view, container ) => _.get( sizingMap, [ size, _.get( viewTypeMap, [ size, view ]), container ]);

const viewTypeMap = {
	large: {
		viewAll: "twoPane",
		viewOne: "twoPane",
		add: "twoPane",
		edit: "twoPane",
		history: "threePane",
	},
	small: {
		viewAll: "onePane",
		viewOne: "twoPane",
		add: "twoPane",
		edit: "twoPane",
		history: "threePane",
	},
};

const sizingMap = {
	small: {
		onePane: {
			one: { left: "0%", right: "0%", top: "0%", bottom: "0%", opacity: 1 },
			two: { left: "0%", right: "0%", top: "100%", bottom: "0%", opacity: 0 },
			three: { left: "0%", right: "0%", top: "100%", bottom: "0%", opacity: 0 },
		},
		twoPane: {
			one: { left: "0%", right: "0%", top: "0%", bottom: "50%", opacity: 1 },
			two: { left: "0%", right: "0%", top: "50%", bottom: "0%", opacity: 1 },
			three: { left: "0%", right: "0%", top: "100%", bottom: "0%", opacity: 0 },
		},
		threePane: {
			one: { left: "0%", right: "0%", top: "0%", bottom: "100%", opacity: 0 },
			two: { left: "0%", right: "0%", top: "0%", bottom: "50%", opacity: 1 },
			three: { left: "0%", right: "0%", top: "50%", bottom: "0%", opacity: 1 },
		},
	},
	large: {
		twoPane: {
			one: { left: "0%", right: "40%", top: "0%", bottom: "0%", opacity: 1 },
			two: { left: "60%", right: "0%", top: "0%", bottom: "0%", opacity: 1 },
			three: { left: "100%", right: "0%", top: "0%", bottom: "0%", opacity: 0 },
		},
		threePane: {
			one: { left: "0%", right: "70%", top: "0%", bottom: "0%", opacity: 1 },
			two: { left: "30%", right: "50%", top: "0%", bottom: "0%", opacity: 1 },
			three: { left: "50%", right: "0%", top: "0%", bottom: "0%", opacity: 1 },
		},
	},
};
