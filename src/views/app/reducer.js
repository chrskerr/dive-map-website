
import _ from "lodash";

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
	default: 
		return { ...state };
	}
};
