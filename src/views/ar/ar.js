
// Packages
import React, { useState, useEffect, useMemo, useRef } from "react";
import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import { Container, Button, Typography } from "@material-ui/core";
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
			paddingBottom: theme.spacing( 1 ),
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

	// Device Orientation
	const [ deviceOrientation, setDeviceOrientation ] = useState( true );
	const _handleDeviceOrientation = e => {
		const x = _.round( e.beta, 0 );
		if ( x !== _.get( deviceOrientation, "x" ))setDeviceOrientation({ x });
	};

	const approve = async () => {
		if ( window.DeviceOrientationEvent ) {
			if ( _.isFunction( window.DeviceOrientationEvent.requestPermission )) {
				window.DeviceOrientationEvent.requestPermission()
					.then( res => {
						if ( res === "granted" ) window.addEventListener( "deviceorientation", _handleDeviceOrientation, false );
					})
					.catch( console.error );
			}
			else window.addEventListener( "deviceorientation", _handleDeviceOrientation, false );
		}
		else alert( "I'm sorry, but your browser won't support augmented reality" );
	};
	useEffect(() => {
		return () => window.removeEventListener( "deviceorientation", _handleDeviceOrientation );
	}, []);

	// GPS
	const [ userCoords, setUserCoords ] = useState( false );
	const [ geoId, setGeoId ] = useState( false );
	const [ geoError, setGeoError ] = useState( false );

	useEffect(() => {
		let id;
		if ( navigator.geolocation && deviceOrientation && !geoId ) {
			id = navigator.geolocation.watchPosition(
				({ coords }) => setUserCoords( coords ),
				() => setGeoError( true ), 
				{ enableHighAccuracy: true },
			);
			setGeoId( id );
		}
		else setGeoError( true );

		return () => { 
			if ( id ) navigator.geolocation.clearWatch( id );
		};
	}, [ deviceOrientation ]);
	useEffect(() => {
		if ( geoError ) {
			navigator.geolocation.clearWatch( geoId );
			setGeoId( false );
		}
	}, [ geoError ]);

	// Camera
	const [ camera, setCamera ] = useState( false );
	const mediaConstraints = { 
		height: _.get( $_root, "current.offsetHeight" ),
		width: _.get( $_root, "current.offsetWidth" ),
		facingMode: { ideal: "environment" },
	};

	useEffect(() => {
		let stream = camera;
		if ( !stream && userCoords ) {
			( async () => {
				stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: mediaConstraints });
				document.getElementById( "ar-video-playback" ).srcObject = stream;
				setCamera( stream );
			})();
		}

		return () => {
			if ( stream ) _.forEach( stream.getTracks(), track => track.stop());
		};
	}, [ userCoords, camera ]);
	
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

	return (
		<div className={ classes.root } ref={ $_root }>
			<Container>
				<Typography>To allow access to augmented reality, we need to request access to device orientation, GPS and your device camera.</Typography>
				<Button 
					variant="contained" 
					color="primary"
					id="request"
					onClick={ approve }
				>
				Proceed?
				</Button>
				<p>x: { _.get( deviceOrientation, "x" ) }</p>
				<br />
				<p>lat: { _.get( userCoords, "latitude" ) }</p>
				<p>lng: { _.get( userCoords, "longitude" ) }</p>
				<p>heading: { _.get( userCoords, "heading" ) }</p>
				<br />
				<p>{ camera ? "Has camera" : "Has no camera" }</p>
			</Container>

			{ ( camera && userCoords && deviceOrientation ) && 
				<div className={ classes.container } style={{ zIndex: 30 }}>
					<Canvas>
						<ThreeRenderer processedDives={ processedDives } userCoords={ userCoords } deviceOrientation={ deviceOrientation } />
					</Canvas>
				</div> 
			}
			<div className={ classes.container } style={{ zIndex: camera ? 25 : -1 }}>
				<video id="ar-video-playback" autoPlay muted />
			</div>
		</div>
	);
}
