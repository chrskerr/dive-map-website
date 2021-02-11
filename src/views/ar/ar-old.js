
// Packages
import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { IconButton } from "@material-ui/core";
import { KeyboardBackspace } from "@material-ui/icons";
import "aframe" ;
import { Scene } from "aframe-react";
import LatLong from "simple-latlong";


// App


const script = document.createElement( "script" );
script.src = "/libs/aframe-ar.js";
document.body.appendChild( script );

const useClasses = makeStyles( theme => ({
	root: {
		// position: "relative",
	},
	closeArContainer: {
		position: "absolute",
		bottom: theme.spacing( 3 ),
		left: theme.spacing( 3 ),
		backgroundColor: "rgba( 255, 255, 255, 1 )",
		borderColor: theme.palette.grey[ 700 ],
		borderWidth: "1px",
		borderStyle: "solid",
		// borderRadius: "100%",
		zIndex: 1201,
		"& .MuiSvgIcon-root": {
			color: theme.palette.grey[ 700 ],
		},
	},
}));

function AR ({ loaded, dives }) {
	const classes = useClasses();
	const history = useHistory();

	useEffect(() => {
		var el = document.querySelector( "a-camera" );
		// el.emit();
		console.log( "camera", el );

	}, []);

	useEffect(() => {
		var el = document.querySelector( "a-scene" );
		console.log( el );
		el.setAttribute( "arjs","sourceType: webcam; debugUIEnabled: false;" );
	}, []);

	const [ bounds, setBounds ] = useState({});
	const [ geoId, setGeoId ] = useState( false );
	useEffect(() => {
		const id = navigator.geolocation.watchPosition(
			({ coords }) => {
				const { latitude, longitude } = coords;

				const lat0 = new LatLong( latitude, longitude );
				lat0.moveSouth( 100 );
				const lat1 = new LatLong( latitude, longitude );
				lat1.moveNorth( 100 );
				const lng0 = new LatLong( latitude, longitude );
				lng0.moveWest( 100 );
				const lng1 = new LatLong( latitude, longitude );
				lng1.moveEast( 100 );

				const newBounds = {
					lat0: lat0.lat,
					lat1: lat1.lat,
					lng0: lng0.lat,
					lng1: lng1.lat,
				};
				if ( !_.isEqual( newBounds, bounds )) setBounds( newBounds );
			}, 
			err => console.error( err ), 
			{ enableHighAccuracy: true },
		);
		setGeoId( id );

		return () => navigator.geolocation.clearWatch( geoId );
	}, []);

	const filteredDiveSites =  useMemo(() => _.filter( dives, dive => {
		const lat = _.get( dive, "coords.main[0].lat" );
		const lng = _.get( dive, "coords.main[0].lng" );
		
		if ( !lat || !lng || _.isEmpty( bounds )) return false;
		else return lat > bounds.lat0 && lat < bounds.lat1 && lng > bounds.lng0 && lng < bounds.lng1;
	}), [ bounds, dives ]);

	console.log( filteredDiveSites );

	return (
		<div className={ classes.root }>
			{ loaded && <div className={ classes.closeArContainer }>
				<IconButton variant="outlined" size="small" aria-label="close-augmented-reality" onClick={ () => {
					history.push( "/" ); //add params empty?
					location.reload();
				} }>
					<KeyboardBackspace />
				</IconButton>
			</div> }
			<Scene>
				<a-camera gps-camera rotation-reader></a-camera>
				{ _.isEmpty( filteredDiveSites ) && _.map( filteredDiveSites, dive => {
					console.log( dive );

					return null;
				})}
			</Scene> 
		</div>
	);
}
AR.propTypes = {
	dives: PropTypes.array,
	loaded: PropTypes.bool,
};

const GET_DIVES = gql`
	query GetAllDives {
		dives {
			id name depth description
			type dive_plan coords
			created_at updated_at
		}
	}
`;

export default function ARWrapper () {
	const { data: allDivesData } = useQuery( GET_DIVES, { fetchPolicy: "cache-and-network" });
	const dives = _.get( allDivesData, "dives" );
	
	const [ arjsContainer, setArjsContainer ] = useState( document.getElementById( "arjs-video" ));
	const [ timer, setTimer ] = useState( false );
	
	useEffect(() => {
		if ( !timer && !arjsContainer ) {
			setTimer( 
				setInterval(() => setArjsContainer( document.getElementById( "arjs-video" )), 100 ),
			);
		}
		return () => {
			if ( timer ) clearInterval( timer );
		};
	}, [ timer, arjsContainer ]);

	return <AR dives={ dives } loaded={ Boolean( arjsContainer )} />;
}
