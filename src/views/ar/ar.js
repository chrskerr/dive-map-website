
// Packages
import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { Canvas, useThree } from "react-three-fiber";
import { Haversine } from "haversine-position";

// App



const useClasses = makeStyles({
	root: {
		position: "relative",
		flexGrow: 1,
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
});

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

	return <AR dives={ dives } />;
}

const AR = ({ dives }) => {
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
				({ coords }) => {
					if ( !_.isEqual( coords, userCoords )) setUserCoords( coords );
				}, 
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
	const [ deviceOrientation, seDeviceOrientation ] = useState( false );
	const _handleDeviceOrientation = e => {
		const newOrientation = { z: e.alpha, x: e.beta, y: e.gamma };
		if ( !_.isEqual( newOrientation, deviceOrientation )) seDeviceOrientation( newOrientation );
	};
	useEffect(() => {
		if ( !requestedOrientation && userCoords && !geoError ) {
			setRequestedOrientation( true );
			window.addEventListener( "deviceorientation", _handleDeviceOrientation, true );
		}
		return () => window.removeEventListener( "deviceorientation", _handleDeviceOrientation );
	}, [ geoId, geoError ]);

	// Camera
	const [ camera, setCamera ] = useState( false );
	const [ videoDimensions, setVideoDimensions ] = useState( false );
	const _handleVideoResize = e => setVideoDimensions({ height: _.get( e, "target.offsetHeight" ), width: _.get( e, "target.offsetWidth" ) });

	useEffect(() => {
		let stream, el;
		if ( !camera ) {
		// if ( deviceOrientation && !camera ) {
			( async () => {
				stream = await navigator.mediaDevices.getUserMedia({ 
					video: true, 
					audio: false,
					facingMode: "environment",
					height: _.get( $_root, "current.offsetHeight" ),
					width: _.get( $_root, "current.offsetWidth" ),
				});
				el = document.getElementById( "ar-video-playback" );
				el.srcObject = stream; 
				el.addEventListener( "resize", _handleVideoResize );
				setCamera( stream );
			})();
		}

		return () => {
			_.forEach( stream.getTracks(), track => track.stop());
			el.removeEventListener( "resize", _handleVideoResize );
		};
	}, [ deviceOrientation ]);

	const origin = {
		lat: _.get( userCoords, "latitude" ) || 1,
		lng: _.get( userCoords, "longitude" ) || 1,
	};

	let haversine;
	if ( origin.lat && origin.lng ) haversine = new Haversine( origin );


	const processedDives = useMemo(() => _.compact( _.map( dives, ({ coords }) => {
		if ( !haversine ) return false; 

		// const main = _.get( coords, "main" );
		// const mainLat = _.get( main, "[0].lat" );
		// const mainLng = _.get( main, "[0].lng" );
		// const distanceToMain = haversine.getDisance({ lat: mainLat, lng: mainLng });

		// if ( distanceToMain > 500 ) return false

		return _.mapValues( coords, type => {
			return _.map( type, coord => ({
				distance: haversine.getDistance( coord ),
				bearing: haversine.getBearing( coord ),
			}));
		});
	})), [ dives, haversine, origin ]);

	return (
		<div className={ classes.root } ref={ $_root }>
			<p>Requesting GPS{ geoId ? ": done!" : "..." }</p>
			{ geoId && <>
				<p>Finding you{ userCoords ? ": done!" : "..." }</p>
				{ userCoords && <>
					<p>Determining device orientation{ deviceOrientation ? ": done!" : "..." }</p>
					{ deviceOrientation &&
						<p>Requesting camera{ camera ? ": done!" : "..." }</p>
					}
				</> }
			</> }
			{/* { ( videoDimensions && userCoords && deviceOrientation ) &&  */}
			{ ( videoDimensions ) && 
				<div className={ classes.container } style={{ zIndex: 30 }}>
					<div style={{ ...videoDimensions }}>
						<Canvas>
							<ThreeRenderer processedDives={ processedDives } userCoords={ userCoords } deviceOrientation={ deviceOrientation } />
						</Canvas>
					</div>
				</div> 
			}
			<div className={ classes.container } style={{ zIndex: 25 }}>
				<video id="ar-video-playback" autoPlay muted />
			</div>
		</div>
	);
};
AR.propTypes = {
	dives: PropTypes.array,
};

const ThreeRenderer = ({ processedDives, userCoords, deviceOrientation }) => {
	const { camera } = useThree();

	console.log( camera, processedDives, userCoords, deviceOrientation );

	useEffect(() => {
		camera.rotation.z = 45 * Math.PI / 180 ; // from orientation 
		camera.rotation.y = 45 * Math.PI / 180 ; // from orientation
		camera.rotation.x = 45 * Math.PI / 180 ; // from compass heading?
	}, []);

	return (
		<mesh visible userData={{ hello: "world" }} position={[ 1, 2, 3 ]} rotation={[ Math.PI / 2, 0, 0 ]}>
			<coneGeometry args={[ 5, 20, 32 ]} />
			<meshStandardMaterial color="hotpink" transparent />
		</mesh>
	);

};
ThreeRenderer.propTypes = {
	processedDives: PropTypes.array,
	userCoords: PropTypes.object,
	deviceOrientation: PropTypes.object,
};
