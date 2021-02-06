
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
	default: 
		return { ...state };
	}
};
