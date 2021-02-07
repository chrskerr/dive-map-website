
// Packages
import React, { useContext } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import _ from "lodash";
import { Button, Paper, Typography } from "@material-ui/core";
import { AddRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useSpring, animated as a, config } from "react-spring";

// App
import { State } from "../";
import Map from "./map";
import AddEdit from "./add-edit";
import One from "./one";

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
			cursor: "pointer",
			"& .MuiTypography-root": {
				fontSize: "85%",
			},
		},
	},
}));

export default function Explore ({ dives }) {
	const classes = useStyles();
	const history = useHistory();
	
	const [ state ] = useContext( State );
	const view = _.get( state, "explore.view" );
	const map = _.get( state, "map.map" );

	const mapProps = useSpring({ 
		..._.get( sizingMap, [ viewTypeMap[ view ], "map" ]),
		onFrame: map ? _.throttle(() => map.invalidateSize(), 20 ) : () => {},
		config: config.default,
	});
	const listProps = useSpring({ 
		..._.get( sizingMap, [ viewTypeMap[ view ], "list" ]),
		config: config.default,
	});
	const diveAddProps = useSpring({ 
		..._.get( sizingMap, [ viewTypeMap[ view ], "diveAdd" ]),
		config: config.default,
	});
	const historyEditProps = useSpring({ 
		..._.get( sizingMap, [ viewTypeMap[ view ], "historyEdit" ]),
		config: config.default,
	});

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ mapProps }>
				<Map allDives={ dives } />
			</a.div>
			<a.div className={ classes.container } style={ listProps }>
				<div className={ classes.content }>
					<div className={ classes.listItem }>
						<Button variant='outlined' size="small" disabled={ view === "add" } fullWidth endIcon={ <AddRounded /> } onClick={ () => history.push( "/explore/add" ) }>Add a New Dive</Button>
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
				</div>
			</a.div>
			<a.div className={ classes.container } style={ diveAddProps }>
				{ view === "add" ? 
					<div className={ classes.content }>
						<AddEdit editing={ false }  />
					</div>
					:
					<div className={ classes.content }>
						<One />
					</div> 
				}
			</a.div>
			<a.div className={ classes.container } style={ historyEditProps }>
				{ view === "edit" ? <p>Edit a dive</p> : <p>View dive edit history</p> }
			</a.div>
		</div>
	</> );
}
Explore.propTypes = {
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
		map: { left: "0%", right: "40%", opacity: 1 },
		list: { left: "40%", right: "60%", opacity: 0 },
		diveAdd: { left: "60%", right: "0%", opacity: 1 },
		historyEdit: { left: "100%", right: "0%", opacity: 0 },
	},
	viewHistoryEdit: {
		map: { left: "0%", right: "70%", opacity: 1 },
		list: { left: "30%", right: "70%", opacity: 0 },
		diveAdd: { left: "30%", right: "50%", opacity: 1 },
		historyEdit: { left: "50%", right: "0%", opacity: 1 },
	},
};

const viewTypeMap = {
	viewAll: "viewAll",
	viewOne: "viewOne",
	history: "viewHistoryEdit",
	add: "viewOne",
	edit: "viewHistoryEdit",
};
