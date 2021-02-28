
// Packages
import React, { useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { gql, useApolloClient, useQuery } from "@apollo/client";
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
	const apolloClient = useApolloClient();
	
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
			if ( view !== "edit" ) {
				dispatch({ type: "explore.setView", view: "edit" });
				getDive( dive );
			}
		}
		else if ( action === "history" ) {
			if ( view !== "history" ) dispatch({ type: "explore.setView", view: "history" });
		}
		else if ( dive ) {
			if ( view !== "viewOne" ) { 
				dispatch({ type: "explore.setView", view: "viewOne" });
				getDive( dive );
			}
		}

		if ( !dive && action ) history.push( "/explore" );
	}, [ dive, action, view ]);

	const [ routeChangeFly, setRouteChangeFly ] = useState( false );
	const getDive = async dive => {
		const data = await apolloClient.query({ query: GET_DIVE, variables: { id: dive }});
		
		const diveData = _.omit( _.get( data, "data.dives_by_pk" ), "__typename" );
		dispatch({ type: "explore.updateDive", dive: diveData });

		setRouteChangeFly( _.get( diveData, "coords.main[0]" ));
	};

	useEffect(() => {
		if ( map && routeChangeFly ) {
			dispatch({ type: "map.fly", latlngs: routeChangeFly, zoom: 17 });
			setRouteChangeFly( false );
		}
	}, [ map, routeChangeFly ]);

	const { data: allDivesData } = useQuery( GET_DIVES, { fetchPolicy: "cache-and-network" });
	const dives = _.get( allDivesData, "dives" );

	const { bounds, markerPositionType } = _.get( state, "explore.map" );
	const filteredDiveSites =  useMemo(() => _.filter( dives, dive => {
		const lat = _.get( dive, `coords.${ markerPositionType }[0].lat` ) || _.get( dive, "coords.main[0].lat" );
		const lng = _.get( dive, `coords.${ markerPositionType }[0].lng` ) || _.get( dive, "coords.main[0].lng" );
		
		if ( !lat || !lng || _.isEmpty( bounds )) return false;
		else return lat > bounds.lat0 && lat < bounds.lat1 && lng > bounds.lng0 && lng < bounds.lng1;
	}), [ bounds, dives ]);

	useEffect(() => {
		return () => dispatch({ type: "explore.setView", view: "reset" });
	}, []);

	return <Explore dives={ filteredDiveSites } />;
}

