
// Packages
import React, { useContext } from "react";
import _ from "lodash";

// App
import { State } from "../";
import ExploreSmall from "./explore-small";
import ExploreLarge from "./explore-large";

export default function Explore () {
	const [ state ] = useContext( State );
	const isSmall = _.get( state, "ui.isSmall" );

	return isSmall ? <ExploreSmall /> : <ExploreLarge />;
}