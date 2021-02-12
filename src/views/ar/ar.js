
// Packages
import React, { useState, useEffect, useMemo, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Canvas } from "react-three-fiber";
import { Haversine } from "haversine-position";

// App
import ThreeRenderer from "./renderer";


const useClasses = makeStyles( theme => ({
	root: {
		position: "relative",
		flexGrow: 1,
		padding: theme.spacing( 2 ),
		"& .MuiTypography-root": {
			fontSize: "90%",
		},
	},
	container: {
		position: "absolute",
		top: 0, bottom: 0,
		left: 0, right: 0,
		overflow: "hidden",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
}));

const GET_DIVES = gql`
	query GetAllDives {
		dives {
			id name depth description
			type dive_plan coords
			created_at updated_at
		}
	}
`;

export default function AR () {
	const classes = useClasses();
	const $_root = useRef();

	// GPS
	const [ userCoords, setUserCoords ] = useState( false );
	const [ geoId, setGeoId ] = useState( false );
	const [ geoError, setGeoError ] = useState( false );
	useEffect(() => {
		let id;
		if ( navigator.geolocation ) {
			id = navigator.geolocation.watchPosition(
				({ coords }) => setUserCoords( coords ),
				() => setGeoError( true ), 
				{ enableHighAccuracy: true },
			);
			setGeoId( id );
		}
		else setGeoError( true );

		return () => navigator.geolocation.clearWatch( id );
	}, []);
	useEffect(() => {
		if ( geoError ) {
			navigator.geolocation.clearWatch( geoId );
			setGeoId( false );
		}
	}, [ geoError ]);

	// Device Orientation
	const [ requestedOrientation, setRequestedOrientation ] = useState( false );
	const [ deviceOrientation, setDeviceOrientation ] = useState( false );
	const _handleDeviceOrientation = e => _.throttle(() => setDeviceOrientation({ z: e.alpha, x: e.beta, y: e.gamma }), 25 );
	useEffect(() => {
		if ( !requestedOrientation && userCoords && !geoError ) {
			setRequestedOrientation( true );
			if ( window.DeviceOrientationEvent ) window.addEventListener( "deviceorientation", _handleDeviceOrientation, false );
		}
		return () => window.removeEventListener( "deviceorientation", _handleDeviceOrientation );
	}, [ geoId, geoError ]);

	// Camera
	const [ camera, setCamera ] = useState( false );
	const mediaConstraints = { 
		height: _.get( $_root, "current.offsetHeight" ),
		width: _.get( $_root, "current.offsetWidth" ),
		facingMode: "environment",
	};

	useEffect(() => {
		let stream;
		if ( !camera && deviceOrientation ) {
			( async () => {
				stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: mediaConstraints });
				document.getElementById( "ar-video-playback" ).srcObject = stream;
				setCamera( stream );
			})();
		}

		return () => _.forEach( stream.getTracks(), track => track.stop());
	}, [ deviceOrientation ]);
	
	useEffect(() => {
		if ( camera ) _.forEach( camera.getTracks(), track => track.applyConstraints( mediaConstraints ));
	}, [ mediaConstraints ]);


	// Dive Data
	const userLat = _.get( userCoords, "latitude" );
	const userLng = _.get( userCoords, "longitude" );
	const [ metresPerDegree, setMetresPerDegree ] = useState({ lat: null, lng: null });

	useEffect(() =>{ 
		const haversine = new Haversine({ lat: userLat, lng: userLng });
		setMetresPerDegree({
			lat: haversine.getDistance({ lat: userLat + 1, lng: userLng }),
			lng: haversine.getDistance({ lat: userLat, lng: userLng + 1 }),
		});
	}, [ userLat, userLng ]);

	const { data: allDivesData } = useQuery( GET_DIVES, { fetchPolicy: "cache-and-network" });
	const dives = _.get( allDivesData, "dives" );

	const processedDives = useMemo(() => _.compact( _.map( dives, ({ coords, type }) => {
		if ( !userLat || !userLng || !metresPerDegree.lat || !metresPerDegree.lng ) return;

		const main = _.get( coords, "main" );
		const x = ( userLng - _.get( main, "[0].lat" )) * metresPerDegree.lat;
		const z = ( _.get( main, "[0].lng" ) - userLng ) * metresPerDegree.lng;

		if ( x > 150 || z > 150 ) return false;

		return {
			type,
			coords: _.mapValues( coords, type => {
				return _.map( type, coord => ({
					z: ( userLat - coord.lat ) * metresPerDegree.lat, // forward to back from camera.y === 0, negative means forward
					x: ( coord.lng - userLng ) * metresPerDegree.lng, // right to left from camera.y === 0, negative means left
				}));
			}),
		};
	})), [ dives, userLat, userLng ]);

	const [ intervalId, setIntervalId ] = useState( false );
	const [ dotsState, setDotsState ] = useState( 0 );
	const dots = dotsState === 0 ? "" : _.join( _.map( _.range( 0, dotsState ), () => "." ), "" );

	useEffect(() => {
		let id;
		if ( !camera && !intervalId ) {
			console.log( "here" );
			id = setInterval(() => setDotsState( d => d >= 3 ? 0 : d + 1 ), 500 );
			setIntervalId( id );
		}
		if ( camera && intervalId ) {
			clearInterval( intervalId );
			setIntervalId( false );
		}

		return () => clearInterval( id );
	}, [ camera ]);

	return (
		<div className={ classes.root } ref={ $_root }>
			<Typography>Requesting GPS{ geoId ? ": done!" : dots }</Typography>
			{ geoId && <>
				<Typography>Finding you{ userCoords ? ": done!" : dots }</Typography>
				{ userCoords && <>
					<Typography>Determining device orientation{ deviceOrientation ? ": done!" : dots }</Typography>
					{ deviceOrientation &&
						<Typography>Requesting camera{ camera ? ": done!" : dots }</Typography>
					}
				</> }
			</> }
			{ ( camera && userCoords && deviceOrientation ) && 
			// { ( camera ) && 
				<div className={ classes.container } style={{ zIndex: 30 }}>
					<Canvas>
						<ThreeRenderer processedDives={ processedDives } userCoords={ userCoords } deviceOrientation={ deviceOrientation } />
					</Canvas>
				</div> 
			}
			<div className={ classes.container } style={{ zIndex: 25 }}>
				<video id="ar-video-playback" autoPlay muted />
			</div>
		</div>
	);
}
