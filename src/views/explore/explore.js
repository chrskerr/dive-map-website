
// Packages
import React, { useReducer } from "react";
import { useParams } from "react-router-dom";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { MapContainer, TileLayer } from "react-leaflet";
import { useSpring, animated as a } from "react-spring";

// App


const useStyles = makeStyles({
	root: {
		flexGrow: 1,
		position: "relative",
	},
	container: {
		position: "absolute",
		top: 0, bottom: 0,	
	},
});

export default function ExploreLarge () {
	const classes = useStyles();
	const { dive } = useParams();
	
	const list = [ "viewAll", "viewOne", "history", "add", "edit" ];

	const [ state, dispatch ] = useReducer( reducer, initialState );
	const { viewType, isEditing, isAdding } = state;

	const mapProps = useSpring({
		..._.get( sizingMap, [ viewType, "map" ]),
		backgroundColor: "red",
	});
	const listProps = useSpring({
		..._.get( sizingMap, [ viewType, "list" ]),
		backgroundColor: "blue",
	});
	const diveAddProps = useSpring({
		..._.get( sizingMap, [ viewType, "diveAdd" ]),
		backgroundColor: "green",
	});
	const historyEditProps = useSpring({
		..._.get( sizingMap, [ viewType, "historyEdit" ]),
		backgroundColor: "yellow",
	});

	// useEffect(() => {
	// 	if ( !dive && viewType !== "viewAll" ) dispatch({ type: "viewAll" });
	// 	if ( dive && viewType === "viewAll" ) dispatch({ type: "viewOne" });
	// });

	console.log( dive );

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ mapProps } onClick={ () => dispatch({ type: _.sample( list ) })}>
				<MapContainer center={[ 51.505, -0.09 ]} zoom={13} scrollWheelZoom={false}>
					<TileLayer
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>

				</MapContainer>
			</a.div>
			<a.div className={ classes.container } style={ listProps } onClick={ () => dispatch({ type: _.sample( list ) })}>
				<p>All dives list</p>
			</a.div>
			<a.div className={ classes.container } style={ diveAddProps } onClick={ () => dispatch({ type: _.sample( list ) })}>
				{ isAdding ? <p>Add a Dive</p> : <p>View a Dive</p> }
			</a.div>
			<a.div className={ classes.container } style={ historyEditProps } onClick={ () => dispatch({ type: _.sample( list ) })}>
				{ isEditing ? <p>Edit a dive</p> : <p>View dive edit history</p> }
			</a.div>
		</div>
	</> );
}

const sizingMap = {
	viewAll: {
		map: { left: "0%", right: "30%", opacity: 1 },
		list: { left: "70%", right: "0%", opacity: 1 },
		diveAdd: { left: "100%", right: "0%", opacity: 0 },
		historyEdit: { left: "100%", right: "0%", opacity: 0 },
	},
	viewOne: {
		map: { left: "0%", right: "70%", opacity: 1 },
		list: { left: "30%", right: "50%", opacity: 1 },
		diveAdd: { left: "50%", right: "0%", opacity: 1 },
		historyEdit: { left: "100%", right: "0%", opacity: 0 },
	},
	viewHistoryEdit: {
		map: { left: "0%", right: "70%", opacity: 1 },
		list: { left: "0%", right: "100%", opacity: 0 },
		diveAdd: { left: "30%", right: "50%", opacity: 1 },
		historyEdit: { left: "50%", right: "0%", opacity: 1 },
	},
};

const reducer = ( state, action ) => {
	const { type } = action;

	switch ( type ) {
	case "viewAll":
		return {
			viewType: "viewAll",
			isEditing: false,
			isAdding: false,
		};
	case "viewOne":
		return {
			viewType: "viewOne",
			isEditing: false,
			isAdding: false,
		};
	case "history":
		return {
			viewType: "viewHistoryEdit",
			isEditing: false,
			isAdding: false,
		};
	case "add":
		return {
			viewType: "viewOne",
			isEditing: false,
			isAdding: true,
		};
	case "edit":
		return {
			viewType: "viewHistoryEdit",
			isEditing: true,
			isAdding: false,
		};
	default: 
		return { ...state };
	}
};

const initialState = {
	view: "viewOne",
	isEditing: false,
	isAdding: false,
};
