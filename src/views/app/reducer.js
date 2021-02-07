
import _ from "lodash";

import initialState from "./initial-state";

export default ( state, action ) => {
	const { type, ...payload } = action;

	switch ( type ) {
	case "auth":
		return {
			...state,
			auth: {
				..._.get( state, "auth" ), 
				...payload,
			},
		};
	case "ui":
		return {
			...state,
			ui: {
				..._.get( state, "ui" ), 
				...payload,
			},
		};
	case "user":
		return {
			...state,
			user: {
				..._.get( state, "user" ), 
				...payload,
			},
		};
	case "userPurge":
		return {
			...state,
			user: {
				..._.get( initialState, "user" ), 
			},
		};

	// Explore
	case "explore.updateDive":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					..._.get( action, "dive" ),
				},
			},
		};
	case "explore.setView": {
		switch ( _.get( action, "view" )) {
		case "viewAll":
			return {
				...state, 
				explore: {
					..._.get( state, "explore" ),
					view: "viewAll",
					dive: { ..._.get( initialState, "explore.dive" ) },
				},
			};
		case "viewOne":
			return {
				...state, 
				explore: {
					..._.get( state, "explore" ),
					view: "viewOne",
					dive: {
						..._.get( state, "explore.dive" ),
						isEditing: false,
						requestFunc: null,
					},
				},
			};
		case "history":
			return {
				...state, 
				explore: {
					..._.get( state, "explore" ),
					view: "history",
					dive: {
						..._.get( state, "explore.dive" ),
						isEditing: false,
						requestFunc: null,
					},
				},
			};
		case "add":
			return {
				...state, 
				explore: {
					..._.get( state, "explore" ),
					view: "add",
					dive: {
						..._.get( state, "explore.dive" ),
						isEditing: true,
					},
				},
			};
		case "edit":
			return {
				...state, 
				explore: {
					..._.get( state, "explore" ),
					view: "edit",
					dive: {
						..._.get( state, "explore.dive" ),
						isEditing: true,
					},
				},
			};

		default: 
			return { ...state };
		}
	}

	// Map
	case "map.setBounds":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				map: {
					..._.get( state, "explore.map" ),
					bounds: _.get( action, "bounds" ),
					map: _.get( action, "map" ),
				},
			},
		};
	case "map.setMarkerPositionType":
		if ( _.get( action, "markerPositionType" ) !== "main" && _.get( action, "markerPositionType" ) !== "journey" ) return { ...state };
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				map: {
					..._.get( state, "explore.map" ),
					markerPositionType: _.get( action, "markerPositionType" ),
				},
			},
		};

	// Add / Edit
	case "addEdit.updateCoords":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					coords: {
						..._.get( state, "explore.dive.coords" ),
						[ _.get( action, "coordType" ) ]: _.compact( _.concat(
							_.get( state,  `explore.dive.coords.${ _.get( action, "coordType" ) }` ),
							_.get( action, "latLng" ),
						)),
					},
				},
			},
		};
	case "addEdit.editCoord":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					coords: {
						..._.get( state, "explore.dive.coords" ),
						[ _.get( action, "coordType" ) ]: _.map( 
							_.get( state,  `explore.dive.coords.${ _.get( action, "coordType" ) }` ), 
							( coord, index ) => index === _.get( action, "index" ) ? _.get( action, "latLng" ) : coord,
						),
					},
				},
			},
		};
	case "addEdit.deleteCoord":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					coords: {
						..._.get( state, "explore.dive.coords" ),
						[ _.get( action, "coordType" ) ]: _.reject( 
							_.get( state,  `explore.dive.coords.${ _.get( action, "coordType" ) }` ), 
							( coord, index ) => index === _.get( action, "index" ),
						),
					},
				},
			},
		};


	case "addEdit.requestMarker":
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					requestFunc: _.get( action, "func" ),
				},
			},
		};
	case "addEdit.supplyMarker":
		state.explore.dive.requestFunc( _.get( action, "latlng" ));
		return {
			...state,
			explore: {
				..._.get( state, "explore" ),
				dive: {
					..._.get( state, "explore.dive" ),
					requestFunc: null,
				},
			},
		};

	default: 
		return { ...state };
	}
};
