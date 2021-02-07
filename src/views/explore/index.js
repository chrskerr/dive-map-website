
// Packages
import React, { useContext, useReducer, useEffect } from "react";
import _ from "lodash";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

// App
import { State } from "../";
import ExploreSmall from "./explore-small";
import ExploreLarge from "./explore-large";

const GET_DIVES = gql`
	query GetAllDives {
		dives {
			id name depth description
			type dive_plan coords
			created_at updated_at
		}
	}
`;

const GET_DIVE = gql`
	query( $id: String! ) {
		dives_by_pk( id: $id ) {
			id name type description depth
			coords dive_plan created_at updated_at
		}
	}
`;

export default function Explore () {
	const [ state ] = useContext( State );
	const isSmall = _.get( state, "ui.isSmall" );
	const { dive } = useParams();
	
	const reducerBag = useReducer( reducer, initialState );
	const [ exploreState, exploreDispatch ] = reducerBag;

	const { data: allDivesData } = useQuery( GET_DIVES );
	const dives = _.get( allDivesData, "dives" );

	const { bounds, markerPositionType } = _.get( exploreState, "map" );
	const filteredDiveSites = _.filter( dives, dive => {
		const lat = _.get( dive, `coords.${ markerPositionType }[0].lat` ) || _.get( dive, "coords.main[0].lat" );
		const lng = _.get( dive, `coords.${ markerPositionType }[0].lng` ) || _.get( dive, "coords.main[0].lng" );
		
		if ( !lat || !lng ) return false;
		else return lat > bounds.lat0 && lat < bounds.lat1 && lng > bounds.lng0 && lng < bounds.lng1;
	});

	const { data: oneDiveData } = useQuery( GET_DIVE, { variables: { id: dive }, skip: !dive });
	const diveData = _.omit( _.get( oneDiveData, "dives_by_pk" ), "__typename" );
	const currentDive = _.get( exploreState, "currentDive" );

	useEffect(() => {
		if ( !_.isEmpty( diveData ) && !_.isEqual( diveData, currentDive )) exploreDispatch({ type: "currentDive.update", currentDive: diveData });
	}, [ diveData ]);

	return isSmall ? <ExploreSmall reducerBag={ reducerBag } dives={ filteredDiveSites } /> : <ExploreLarge reducerBag={ reducerBag } dives={ filteredDiveSites } />;
}

const reducer = ( state, action ) => {
	const { type  } = action;
	const { addEdit, map } = state;

	switch ( type ) {

	// Adding and Editing stuff
	case "addEdit.updateCoords":
		return {
			...state,
			addEdit: {
				...addEdit,
				coords: {
					...addEdit.coords,
					[ _.get( action, "coordType" ) ]: _.compact( _.concat(
						_.get( state,  `addEdit.coords.${ _.get( action, "coordType" ) }` ),
						_.get( action, "latLng" ),
					)),
				},
				isActive: true,
			},
		};
	case "addEdit.editCoord":
		return {
			...state,
			addEdit: {
				...addEdit,
				coords: {
					...addEdit.coords,
					[ _.get( action, "coordType" ) ]: _.map( 
						_.get( state,  `addEdit.coords.${ _.get( action, "coordType" ) }` ), 
						( coord, index ) => index === _.get( action, "index" ) ? _.get( action, "latLng" ) : coord,
					),
				},
				isActive: true,
			},
		};
	case "addEdit.deleteCoord":
		return {
			...state,
			addEdit: {
				...addEdit,
				coords: {
					...addEdit.coords,
					[ _.get( action, "coordType" ) ]: _.reject( 
						_.get( state,  `addEdit.coords.${ _.get( action, "coordType" ) }` ), 
						( coord, index ) => index === _.get( action, "index" ),
					),
				},
				isActive: true,
			},
		};
	case "addEdit.updateDiveType":
		return {
			...state,
			addEdit: {
				...addEdit,
				diveType: _.get( action, "diveType" ),
				isActive: true,
			},
		};
	case "addEdit.requestMarker":
		return {
			...state,
			addEdit: {
				...addEdit,
				isRequesting: true,
				func: _.get( action, "func" ),
				isActive: true,
			},
		};
	case "addEdit.supplyMarker":
		state.addEdit.func( _.get( action, "latlng" ));
		return {
			...state,
			addEdit: {
				...addEdit,
				func: () => {},
				isRequesting: false,
				isActive: true,
			},
		};
	case "addEdit.clear":
		return { 
			...state,
			addEdit: { ...initialState.addEdit },
		};

	// Large View
	case "lgView.viewAll":
		return {
			...state,
			lgView: {
				viewName: "viewAll",
				viewType: "viewAll",
				isEditing: false,
				isAdding: false,
			},
			addEdit: { ...initialState.addEdit },
			currentDive: { ...initialState.currentDive },
		};
	case "lgView.add":
		return {
			...state,
			lgView: {
				viewName: "add",
				viewType: "viewOne",
				isEditing: false,
				isAdding: true,
			},
			addEdit: {
				...addEdit,
				isActive: true,
			},
		};
	case "lgView.viewOne":
		return {
			...state,
			lgView: {
				viewName: "viewOne",
				viewType: "viewOne",
				isEditing: false,
				isAdding: false,
			},
			addEdit: { ...initialState.addEdit },
		};
	case "lgView.history":
		return {
			...state,
			lgView: {
				viewName: "history",
				viewType: "viewHistoryEdit",
				isEditing: false,
				isAdding: false,
			},
			addEdit: { ...initialState.addEdit },
		};
	case "lgView.edit":
		return {
			...state,
			lgView: {
				viewName: "edit",
				viewType: "viewHistoryEdit",
				isEditing: true,
				isAdding: false,
			},
			addEdit: {
				...addEdit,
				isActive: true,
			},
			currentDive: { ...initialState.currentDive },
		};

	// Map
	case "map.setBounds":
		return {
			...state,
			map: {
				...map,
				bounds: _.get( action, "bounds" ),
				map: _.get( action, "map" ),
			},
		};
	case "map.setMarkerPositionType":
		if ( _.get( action, "markerPositionType" ) !== "main" && _.get( action, "markerPositionType" ) !== "journey" ) return { ...state };
		return {
			...state,
			map: {
				...map,
				markerPositionType: _.get( action, "markerPositionType" ),
			},
		};

	// Current Dive
	case "currentDive.update":
		return {
			...state,
			currentDive: _.get( action, "currentDive" ),
		};

	// Default
	default: 
		console.log( "Unrecognised type:", type );
		return state;
	}
};

const initialState = {
	lgView: {
		viewName: "viewAll",
		viewType: "viewAll",
		isEditing: false,
		isAdding: false,
	},
	addEdit: {
		coords: {},
		diveType: "",
		isRequesting: false,
		isActive: false,
		func: () => {},
	},
	currentDive: {
		id: "",
		depth: 0,
		name: "", 
		type: "",
		description: "", 
		coords: {}, 
		dive_plan: "", 
		created_at: "", 
		updated_at: "",
	},
	map: {
		bounds: {},
		map: null,
		markerPositionType: "main",
	},
};