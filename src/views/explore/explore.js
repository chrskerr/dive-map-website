
// Packages
import React, { useContext } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { useSpring, animated as a, config } from "react-spring";

// App
import { State } from "../";
import Map from "./map";
import AddEdit from "./add-edit";
import One from "./one";
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
}));

export default function Explore ({ dives }) {
	const classes = useStyles();
	
	const [ state ] = useContext( State );
	const view = _.get( state, "explore.view" );
	const map = _.get( state, "explore.map.map" );
	const size = _.get( state, "ui.isSmall" ) ? "small" : "large"; 

	const mapProps = useSpring({ 
		...getProps( size, view, "map" ),
		onFrame: map ? _.throttle(() => map.invalidateSize(), 20 ) : () => {},
		config: config.default,
	});
	const listProps = useSpring({ 
		...getProps( size, view, "list" ),
		config: config.default,
	});
	const diveAddProps = useSpring({ 
		...getProps( size, view, "diveAdd" ),
		config: config.default,
	});
	const historyEditProps = useSpring({ 
		...getProps( size, view, "historyEdit" ),
		config: config.default,
	});

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ mapProps }>
				<Map allDives={ dives } />
			</a.div>
			<a.div className={ classes.container } style={ listProps }>
				<div className={ classes.content }>
					<DivesList dives={ dives } />
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

const getProps = ( size, view, container ) => {

	const viewType = viewTypeMap[ view ];

	const sizingMap = {
		small: {
			viewAll: {
				map: { left: 0, right: 0, top: 0, bottom: "50%", opacity: 1 },
				list: { left: 0, right: 0, top: "50%", bottom: 0, opacity: 1 },
				diveAdd: { left: 0, right: 0, top: "100%", bottom: 0, opacity: 0 },
				historyEdit: { left: 0, right: 0, top: "100%", bottom: 0, opacity: 0 },
			},
			viewOne: {
				map: { left: 0, right: 0, top: 0, bottom: "65%", opacity: 1 },
				list: { left: 0, right: 0, top: "0%", bottom: 0, opacity: 0 },
				diveAdd: { left: 0, right: 0, top: "35%", bottom: 9, opacity: 1 },
				historyEdit: { left: 0, right: 0, top: "100%", bottom: 0, opacity: 0 },
			},
			viewHistoryEdit: {
				map: { left: 0, right: 0, top: 0, bottom: "100%", opacity: 0 },
				list: { left: 0, right: 0, top: "0%", bottom: "100%", opacity: 0 },
				diveAdd: { left: 0, right: 0, top: "0%", bottom: "50%", opacity: 1 },
				historyEdit: { left: 0, right: 0, top: "50%", bottom: "0%", opacity: 1 },
			},
		},
		large: {
			viewAll: {
				map: { left: "0%", right: "30%", top: 0, bottom: 0, opacity: 1 },
				list: { left: "70%", right: "0%", top: 0, bottom: 0, opacity: 1 },
				diveAdd: { left: "100%", right: "0%", top: 0, bottom: 0, opacity: 0 },
				historyEdit: { left: "100%", right: "0%", top: 0, bottom: 0, opacity: 0 },
			},
			viewOne: {
				map: { left: "0%", right: "40%", top: 0, bottom: 0, opacity: 1 },
				list: { left: "40%", right: "60%", top: 0, bottom: 0, opacity: 0 },
				diveAdd: { left: "60%", right: "0%", top: 0, bottom: 0, opacity: 1 },
				historyEdit: { left: "100%", right: "0%", top: 0, bottom: 0, opacity: 0 },
			},
			viewHistoryEdit: {
				map: { left: "0%", right: "70%", top: 0, bottom: 0, opacity: 1 },
				list: { left: "30%", right: "70%", top: 0, bottom: 0, opacity: 0 },
				diveAdd: { left: "30%", right: "50%", top: 0, bottom: 0, opacity: 1 },
				historyEdit: { left: "50%", right: "0%", top: 0, bottom: 0, opacity: 1 },
			},
		},
	};

	return _.get( sizingMap, [ size, viewType, container ]);
};

const viewTypeMap = {
	viewAll: "viewAll",
	viewOne: "viewOne",
	history: "viewHistoryEdit",
	add: "viewOne",
	edit: "viewHistoryEdit",
};
