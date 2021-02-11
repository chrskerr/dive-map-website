
// Packages
import React, { useContext, useEffect, useMemo } from "react";
import _ from "lodash";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

// App
import { State } from "../";
import Explore from "./explore";

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

export default function Index () {
	const [ state, dispatch ] = useContext( State );
	const { dive, action } = useParams();
	
	const map = _.get( state, "explore.map.map" );
	const view = _.get( state, "explore.view" );

	useEffect(() => {
		if ( dive === "add" ) { 
			if ( view !== "add" ) dispatch({ type: "explore.setView", view: "add" });
		}
		else if ( !dive  ) {
			if ( view !== "viewAll" ) dispatch({ type: "explore.setView", view: "viewAll" });
		}
		else if ( action === "edit" ) {
			if ( view !== "edit" ) dispatch({ type: "explore.setView", view: "edit" });
		}
		else if ( action === "history" ) {
			if ( view !== "history" ) dispatch({ type: "explore.setView", view: "history" });
		}
		else if ( dive ) {
			if ( view !== "viewOne" ) dispatch({ type: "explore.setView", view: "viewOne" });
		}

		if ( !dive && action ) history.push( "/explore" );
	}, [ dive, action, view ]);

	useEffect(() => {
		const latlngs = _.get( state, "explore.dive.coords.main[0]" );
		if ( map && !_.isEmpty( latlngs ) && view !== "add" && view !== "viewAll" ) { 
			dispatch({ type: "map.fly", latlngs, zoom: 14 });
		}
	}, [ view, map ]);

	const { data: allDivesData } = useQuery( GET_DIVES, { fetchPolicy: "cache-and-network" });
	const dives = _.get( allDivesData, "dives" );

	const { bounds, markerPositionType } = _.get( state, "explore.map" );
	const filteredDiveSites =  useMemo(() => _.filter( dives, dive => {
		const lat = _.get( dive, `coords.${ markerPositionType }[0].lat` ) || _.get( dive, "coords.main[0].lat" );
		const lng = _.get( dive, `coords.${ markerPositionType }[0].lng` ) || _.get( dive, "coords.main[0].lng" );
		
		if ( !lat || !lng || _.isEmpty( bounds )) return false;
		else return lat > bounds.lat0 && lat < bounds.lat1 && lng > bounds.lng0 && lng < bounds.lng1;
	}), [ bounds, dives ]);

	const { data: oneDiveData } = useQuery( GET_DIVE, { variables: { id: dive }, skip: !dive });
	const diveData = _.omit( _.get( oneDiveData, "dives_by_pk" ), "__typename" );

	const currentDive = _.get( state, "explore.dive" );
	const isEditing = view === "add" || view === "edit";

	useEffect(() => {
		if ( !isEditing && !_.isEmpty( diveData ) && !_.isEqual( diveData, currentDive )) {
			dispatch({ type: "explore.updateDive", dive: diveData });
		}
	}, [ diveData ]);

	return <Explore dives={ filteredDiveSites } />;
}

