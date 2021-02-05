
// Packages
import React, { useReducer, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import _ from "lodash";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MapContainer } from "react-leaflet";
import { useSpring, animated as a } from "react-spring";

// App
import Map from "./map";

const useStyles = makeStyles({
	root: {
		flexGrow: 1,
		position: "relative",
	},
	container: {
		position: "absolute",
		top: 0, bottom: 0,
		left: 0, right: "100%",
	},
	map: {
		height: "100%", width: "100%",
		minHeight: "100px",
	},
});

export default function ExploreSmall () {
	const classes = useStyles();
	const { dive } = useParams();
	
	const [ bounds, setBounds ] = useState();
	const [ state, dispatch ] = useReducer( reducer, initialState );
	const { viewType, viewName, isEditing, isAdding } = state;

	const mapProps = useSpring({ ..._.get( sizingMap, [ viewType, "map" ]) });
	const listProps = useSpring({ ..._.get( sizingMap, [ viewType, "list" ]) });
	const diveAddProps = useSpring({
		..._.get( sizingMap, [ viewType, "diveAdd" ]),
		backgroundColor: "green",
	});
	const historyEditProps = useSpring({
		..._.get( sizingMap, [ viewType, "historyEdit" ]),
		backgroundColor: "yellow",
	});

	useEffect(() => {
		if ( !dive && viewName !== "viewAll" && viewName !== "add" ) dispatch({ type: "viewAll" });
		if ( dive && viewName === "viewAll" ) dispatch({ type: "viewOne" });
	}, [ dive, viewName ]);

	console.log( bounds );

	return ( <>
		<div className={ classes.root }>
			<a.div className={ classes.container } style={ mapProps }>
				<MapContainer className={ classes.map } center={[ 15, 15 ]} zoom={ 1.75 }>
					<Map emitBounds={ bounds => setBounds( bounds ) } />
				</MapContainer>
			</a.div>
			<a.div className={ classes.container } style={ listProps }>
				<div>
					<Button variant='outlined' onClick={ () => dispatch({ type: "add" })}>Add a New Dive</Button>
				</div>
			</a.div>
			<a.div className={ classes.container } style={ diveAddProps }>
				{ isAdding ? <Button variant='outlined' onClick={ () => dispatch({ type: "viewAll" })}>Return</Button>
					:
					<div>
					</div> 
				}
			</a.div>
			<a.div className={ classes.container } style={ historyEditProps }>
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
			viewName: "viewAll",
			viewType: "viewAll",
			isEditing: false,
			isAdding: false,
		};
	case "add":
		return {
			viewName: "add",
			viewType: "viewOne",
			isEditing: false,
			isAdding: true,
		};
	case "viewOne":
		return {
			viewName: "viewOne",
			viewType: "viewOne",
			isEditing: false,
			isAdding: false,
		};
	case "history":
		return {
			viewName: "history",
			viewType: "viewHistoryEdit",
			isEditing: false,
			isAdding: false,
		};
	case "edit":
		return {
			viewName: "edit",
			viewType: "viewHistoryEdit",
			isEditing: true,
			isAdding: false,
		};
	default: 
		return state;
	}
};

const initialState = {
	viewName: "viewAll",
	viewType: "viewAll",
	isEditing: false,
	isAdding: false,
};
