
// Packages
import React, { useContext, useReducer } from "react";
import _ from "lodash";
import { gql, useQuery } from "@apollo/client";

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

export default function Explore () {
	const [ state ] = useContext( State );
	const isSmall = _.get( state, "ui.isSmall" );
	const reducerBag = useReducer( reducer, initialState );

	const { data } = useQuery( GET_DIVES );
	const dives = _.get( data, "dives" );

	return isSmall ? <ExploreSmall reducerBag={ reducerBag } dives={ dives } /> : <ExploreLarge reducerBag={ reducerBag } dives={ dives } />;
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
		};

	// Map
	case "map.setBounds":
		return {
			...state,
			map: {
				...map,
				bounds: _.get( action, "bounds" ),
			},
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
	map: {
		bounds: {},
	},
};