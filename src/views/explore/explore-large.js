
// Packages
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import _ from "lodash";
import { Button, Paper } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useSpring, animated as a } from "react-spring";

// App
import Map from "./map";
import Add from "./add";

const useStyles = makeStyles( theme => ({
	root: {
		flexGrow: 1,
		position: "relative",
	},
	container: {
		position: "absolute",
		top: 0, bottom: 0,
		borderRight: `${ theme.palette.grey[ "600" ] } inset 1px`,
	},
	content: {
		padding: theme.spacing( 2 ),
		overflowY: "scroll",
		overflowX: "hidden",
		height: "100%",
	},
	listItem: {
		marginBottom: theme.spacing( 2 ),
		"& .MuiPaper-root": {
			padding: theme.spacing( 1 ),
		},
	},
}));

export default function ExploreLarge ({ reducerBag, dives }) {
	const classes = useStyles();
	const { dive } = useParams();
	
	const [ state, dispatch ] = reducerBag;
	const { viewType, viewName, isEditing, isAdding } = _.get( state, "lgView" ) || {};
	// const bounds = _.get( state, "map.bounds" );

	const mapProps = useSpring( _.get( sizingMap, [ viewType, "map" ]));
	const listProps = useSpring( _.get( sizingMap, [ viewType, "list" ]));
	const diveAddProps = useSpring( _.get( sizingMap, [ viewType, "diveAdd" ]));
	const historyEditProps = useSpring( _.get( sizingMap, [ viewType, "historyEdit" ]));

	useEffect(() => {
		if ( !dive && viewName !== "viewAll" && viewName !== "add" ) dispatch({ type: "lgView.viewAll" });
		if ( dive && viewName === "viewAll" ) dispatch({ type: "lgView.viewOne" });
	}, [ dive, viewName ]);

	const filteredDiveSites = dives;

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ mapProps }>
				<Map reducerBag={ reducerBag } allDives={ dives } />
			</a.div>
			<a.div className={ classes.container } style={ listProps }>
				<div className={ classes.content }>
					<div className={ classes.listItem }>
						<Button variant='outlined' size="small" disabled={ viewName === "add" } fullWidth endIcon={ <AddRounded /> } onClick={ () => dispatch({ type: "lgView.add" })}>Add a New Dive</Button>
					</div>
					{ !_.isEmpty( filteredDiveSites ) && _.map( filteredDiveSites, site => {
						const { id, name } = site;
						return <div className={ classes.listItem } key={ id }>
							<Paper>
								<p>{ name }</p>
							</Paper>
						</div>;
					})}
				</div>
			</a.div>
			<a.div className={ classes.container } style={ diveAddProps }>
				{ isAdding ? 
					<div className={ classes.content }>
						<Add reducerBag={ reducerBag } />
					</div>
					:
					<div className={ classes.content }>
					</div> 
				}
			</a.div>
			<a.div className={ classes.container } style={ historyEditProps }>
				{ isEditing ? <p>Edit a dive</p> : <p>View dive edit history</p> }
			</a.div>
		</div>
	</> );
}
ExploreLarge.propTypes = {
	reducerBag: PropTypes.array,
	dives: PropTypes.array,
};

const sizingMap = {
	viewAll: {
		map: { left: "0%", right: "30%", opacity: 1 },
		list: { left: "70%", right: "0%", opacity: 1 },
		diveAdd: { left: "100%", right: "0%", opacity: 0 },
		historyEdit: { left: "100%", right: "0%", opacity: 0 },
	},
	viewOne: {
		map: { left: "0%", right: "60%", opacity: 1 },
		list: { left: "40%", right: "40%", opacity: 1 },
		diveAdd: { left: "60%", right: "0%", opacity: 1 },
		historyEdit: { left: "100%", right: "0%", opacity: 0 },
	},
	viewHistoryEdit: {
		map: { left: "0%", right: "70%", opacity: 1 },
		list: { left: "0%", right: "100%", opacity: 0 },
		diveAdd: { left: "30%", right: "50%", opacity: 1 },
		historyEdit: { left: "50%", right: "0%", opacity: 1 },
	},
};
