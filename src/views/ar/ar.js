
// Packages
import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { gql, useQuery } from "@apollo/client";
import _ from "lodash";
import { Container, ButtonGroup, Button, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { AutorenewRounded, ChevronRight } from "@material-ui/icons";
import { Canvas } from "react-three-fiber";
import { Haversine } from "haversine-position";

// App
import { Entities, Camera } from "./renderer";

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
	locationAccuracy: {
		position: "absolute",
		top: theme.spacing( 1 ),
		right: theme.spacing( 1 ),
		padding: theme.spacing( 1 ),
		backgroundColor: theme.palette.common.white,
		color: theme.palette.common.black,
		zIndex: 35,
	},
	spinner: {
		animation: "$rotation 2s infinite linear",
	},
	"@keyframes rotation": {
		from: {
			transform: "rotate(0deg)",
		},
		to: {
			transform: "rotate(359deg)",
		},
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

export default function ARContainer () {
	const classes = useClasses();
	const $_root = useRef();

	const [ isReadyToRender, setIsReadyToRender ] = useState( false );

	// Camera State
	const [ camera, setCamera ] = useState( false );
	const [ cameraError, setCameraError ] = useState( false );
	const [ isCameraLoading, setIsCameraLoading ] = useState( false );
	const mediaConstraints = { 
		height: _.get( $_root, "current.offsetHeight" ),
		width: _.get( $_root, "current.offsetWidth" ),
		facingMode: { exact: "environment" },
		resizeMode: { ideal: "crop-and-scale" },
	};

	const approveCamera = async () => {
		setIsCameraLoading( true );
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: mediaConstraints });
			document.getElementById( "ar-video-playback" ).srcObject = stream;
			setCamera( stream );
		}
		catch ( err ) {
			console.error( err );
			setCameraError( true );
		}
		setIsCameraLoading( false );
	};

	// Handle changes to constraints and page sizing
	useEffect(() => {
		if ( camera ) _.forEach( camera.getTracks(), track => track.applyConstraints( mediaConstraints ));
	}, [ mediaConstraints ]);

	return (
		<div className={ classes.root } ref={ $_root }>
			<AR 
				approveCamera={ approveCamera } 
				emit={ setIsReadyToRender }
				camera={ camera }
				cameraError={ cameraError }
				setCamera={ setCamera }
				isCameraLoading={ isCameraLoading }
			/>
			<div className={ classes.container } style={{ zIndex: isReadyToRender ? 25 : -1 }}>
				{ $_root && 
					<video 
						id="ar-video-playback" 
						autoPlay 
						muted 
						playsInline
						height={ _.get( $_root, "current.offsetHeight" ) } 
						width={ _.get( $_root, "current.offsetWidth" ) }
					/> 
				}
			</div>
		</div>
	);
}

function AR ({ approveCamera, emit, camera, cameraError, setCamera, isCameraLoading }) {
	const classes = useClasses();
	const theme = useTheme();

	// Device Orientation State
	const [ deviceOrientation, setDeviceOrientation ] = useState( false );
	const [ deviceOrientationError, setDeviceOrientationError ] = useState( false );
	const _handleDeviceOrientation = e => _.throttle(() => {
		const x = _.round( _.get( e, "beta" ), 1 ); 
		const z = _.round( _.get( e, "alpha" ), 1 ); 
		const y = _.round( _.get( e, "gamma" ), 1 );
		const webkitCompassHeading = _.round( _.get( e, "webkitCompassHeading" ) , 1 );
		const absolute = _.round( _.get( e, "absolute" ), 1 );

		if ( 
			x !== _.get( deviceOrientation, "x" ) || 
			z !== _.get( deviceOrientation, "z" ) || 
			y !== _.get( deviceOrientation, "y" ) ||
			webkitCompassHeading !== _.get( deviceOrientation, "webkitCompassHeading" ) ||
			absolute !== _.get( deviceOrientation, "absolute" )
		) {
			setDeviceOrientation({ x, z, y, webkitCompassHeading, absolute });
		}
	}, 50 )();
	const [ isOrientationLoading, setIsOrientationLoading ] = useState( false );


	// GPS State
	const [ userCoords, setUserCoords ] = useState( false );
	const [ geoId, setGeoId ] = useState( false );
	const [ geoError, setGeoError ] = useState( false );
	const [ isGeoLoading, setIsGeoLoading ] = useState( false );
	const locationAccuracy = _.get( userCoords, "accuracy" );

	// Approve Function
	const approveOrientation = async () => {
		setIsOrientationLoading( true );		
		if ( window.DeviceOrientationEvent ) {
			if ( _.isFunction( window.DeviceOrientationEvent.requestPermission )) {
				try {
					const res = await window.DeviceOrientationEvent.requestPermission();
					if ( res === "granted" ) window.addEventListener( "deviceorientation", _handleDeviceOrientation, true );
					setIsOrientationLoading( false );
				}
				catch ( err ) {
					console.error( err );
					setDeviceOrientationError( true );
					setIsOrientationLoading( false );
				}
			}
			else {
				window.addEventListener( "deviceorientation", _handleDeviceOrientation, true );
				setIsOrientationLoading( false );
			}
		}
		else {
			setDeviceOrientationError( true );
			setIsOrientationLoading( false );
			alert( "I'm sorry, but your browser won't support augmented reality" );
		}
	};

	const approveGPS = () => {
		setIsGeoLoading( true );			
		if ( navigator.geolocation ) {
			setGeoId( navigator.geolocation.watchPosition(
				({ coords }) => setUserCoords( coords ),
				() => setGeoError( true ), 
				{ 
					enableHighAccuracy: true,
					timeout: 500,
					maximumAge: 500,
				},
			));
		}
		else setGeoError( true );
		setIsGeoLoading( false );
	};

	// Handle errors
	useEffect(() => {
		if ( geoError || deviceOrientationError || cameraError ) {
			window.removeEventListener( "deviceorientation", _handleDeviceOrientation );
			setIsOrientationLoading( false );
		}
	}, [ geoError, deviceOrientationError, cameraError ]);

	useEffect(() => {
		if (( geoError || deviceOrientationError || cameraError ) && camera ) {
			_.forEach( camera.getTracks(), track => track.stop());
			setCamera( false );
		}
	}, [ geoError, deviceOrientationError, cameraError, camera ]);

	useEffect(() => {
		if (( geoError || deviceOrientationError || cameraError ) && geoId ) {
			navigator.geolocation.clearWatch( geoId );
			setGeoId( false );
		}
	}, [ geoError, deviceOrientationError, cameraError, geoId ]);

	// Create Dive Marker Data
	const userLat = _.get( userCoords, "latitude" ) || -42.009876131256654;
	const userLng = _.get( userCoords, "longitude" ) || 148.24154909705484;
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

	const processedDives = useMemo(() => _.compact( _.map( dives, dive => {
		if ( !userLat || !userLng || !metresPerDegree.lat || !metresPerDegree.lng ) return;

		const { coords, type } = dive;
		const main = _.get( coords, "main" );
		const x = Math.abs( userLat - _.get( main, "[0].lat" )) * metresPerDegree.lat;
		const z = Math.abs( _.get( main, "[0].lng" ) - userLng ) * metresPerDegree.lng;

		if ( x > 250 || z > 250 ) return false;

		return {
			type,
			coords: _.mapValues( coords, type => {
				return _.map( type, coord => ({
					z: ( userLat - coord.lat ) * metresPerDegree.lat, // forward to back from camera.y === 0, negative means forward
					x: ( coord.lng - userLng ) * metresPerDegree.lng, // right to left from camera.y === 0, negative means left
				}));
			}),
		};
	})), [ dives, userLat, userLng, metresPerDegree ]);

	// Cleanup
	useEffect(() => {
		return () => {
			window.removeEventListener( "deviceorientation", _handleDeviceOrientation );
			if ( geoId ) navigator.geolocation.clearWatch( geoId );
			if ( camera ) _.forEach( camera.getTracks(), track => track.stop());
		};
	}, [ geoId, camera ]);

	const isReadyToRender = camera && userCoords && deviceOrientation;

	useEffect(() => {
		emit( isReadyToRender );
	}, [ isReadyToRender ]);

	return (
		<>
			<Container>
				<Typography>To allow access to augmented reality, we need to request access to device orientation, GPS and your device camera.</Typography>
				<ButtonGroup orientation="vertical" color="primary">
					<Button 
						variant="contained" 
						id="request"
						onClick={ approveOrientation }
						disabled={ isOrientationLoading || deviceOrientation }
						endIcon={ isOrientationLoading ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRight /> }
					>
					Approve Device Orientation
					</Button>
					<Button 
						variant="contained" 
						id="request"
						onClick={ approveGPS }
						disabled={ isGeoLoading || !deviceOrientation || deviceOrientationError || geoId }
						endIcon={ isGeoLoading ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRight /> }
					>
					Approve GPS
					</Button>
					<Button 
						variant="contained" 
						id="request"
						onClick={ approveCamera }
						disabled={ isCameraLoading || !geoId || geoError || !deviceOrientation || deviceOrientationError || camera }
						endIcon={ isCameraLoading ? <AutorenewRounded className={ classes.spinner } /> : <ChevronRight /> }
					>
					Approve Camera
					</Button>
				</ButtonGroup>
			</Container>
			<div className={ classes.container } style={{ zIndex: isReadyToRender ? 30 : -1 }}>
				{ locationAccuracy && 
				<div className={ classes.locationAccuracy }>
					<p>GPS Accuracy: { locationAccuracy }m</p>
					{ geoId && <p>Geo ID</p> }
					{ geoError && <p>Geo error</p> }
					{ cameraError && <p>Camera error</p> }
					{ deviceOrientationError && <p>Orientation error</p> }
				</div>
				}

				<Canvas>
					{/* { ( !_.isEmpty( processedDives ) && userCoords && deviceOrientation ) && <> */}
					<Entities 
						processedDives={ processedDives } 
						theme={ theme }
					/>
					<Camera deviceOrientation={ deviceOrientation } />
					{/* </> } */}
				</Canvas>
			</div> 
		</>
	);
}
AR.propTypes = {
	approveCamera: PropTypes.func,
	camera: PropTypes.oneOfType([ 
		PropTypes.bool, 
		PropTypes.object,
	]),
	emit: PropTypes.func,
	setCamera: PropTypes.func,
	cameraError: PropTypes.bool,
	isCameraLoading: PropTypes.bool,
};
