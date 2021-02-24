
// Packages
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import * as THREE from "three";
import { useThree } from "react-three-fiber";

// App

const Entities = React.memo( function Entities ({ processedDives, theme }) {
	const resources = useRef([]);
	const trackResource = resource => {
		if ( _.get( resource, "dispose" )) resources.current.push( resource );
		return resource;
	};

	console.log( resources.current );
	console.log( processedDives );

	_.forEach( resources.current, resource => {
		try {
			const dispose = _.get( resource, "dispose" );
			console.log( dispose );
			if ( dispose && _.isFunction( dispose )) dispose();
		}
		catch ( err ) {
			console.error( err );
		}
	});

	resources.current = [];

	const mainMarkers = _.compact( _.flatMap( processedDives, "coords.main" ));
	const journeyMarkers = _.compact( _.flatMap( processedDives, "coords.journey" ));
	
	const areas = _.compact( _.map( _.filter( processedDives, { type: "area" }), "coords.main" ));
	const routes = _.compact( _.map( _.filter( processedDives, { type: "route" }), dive => {
		const coords = _.get( dive, "coords.main" );

		const starting = _.head( coords );
		const startingX = _.get( starting, "x" );
		const startingZ = _.get( starting, "z" );

		const points = _.map( coords, point => new THREE.Vector3( point.x - startingX, 0, point.z - startingZ ));
		const lineGeometry = trackResource( new THREE.BufferGeometry().setFromPoints( points ));

		return { lineGeometry, start: [ startingX, -1, startingZ ]};
	}));

	const journeys = _.compact( _.map( _.filter( processedDives, { type: "route" }), dive => {
		const coords = _.compact( _.concat( _.get( dive, "coords.journey" ), _.get( dive, "coords.main[0]" )));

		const starting = _.head( coords );
		const startingX = _.get( starting, "x" );
		const startingZ = _.get( starting, "z" );

		const points = _.map( coords, point => new THREE.Vector3( point.x - startingX, 0, point.z - startingZ ));
		const lineGeometry = trackResource( new THREE.BufferGeometry().setFromPoints( points ));

		return { lineGeometry, start: [ startingX, -1, startingZ ]};
	}));

	console.log( journeys );

	return <>
		<pointLight position={[ 5, 5, 5 ]} />
		{ !_.isEmpty( mainMarkers ) && _.map( mainMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, -1, z ]}> 
				<octahedronGeometry />
				<meshStandardMaterial color={ theme.palette.green.main } />
			</mesh>
		)) }
		{ !_.isEmpty( journeyMarkers ) && _.map( journeyMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, -1, z ]}>
				<octahedronGeometry />
				<meshStandardMaterial color={ theme.palette.purple.main } emissiveIntensity={ 0.25 } roughness={ 0.8 } />
			</mesh>
		)) }
		{ !_.isEmpty( routes ) && _.map( routes, ({ lineGeometry, start } , i ) => {
			return (
				<group position={ start } key={ i }>
					<line geometry={ lineGeometry }>
						<lineBasicMaterial attach="material" color={ theme.palette.green.main } />
					</line>
				</group>
			);
		})}
		{ !_.isEmpty( journeys ) && _.map( journeys, ({ lineGeometry, start } , i ) => {
			return (
				<group position={ start } key={ i }>
					<line geometry={ lineGeometry }>
						<lineBasicMaterial attach="material" color={ theme.palette.purple.main } />
					</line>
				</group>
			);
		})}
		{ !_.isEmpty( areas ) && null }
	</>;
});
Entities.propTypes = {
	processedDives: PropTypes.array,
	theme: PropTypes.object,
};


const Camera = React.memo( function Camera ({ deviceOrientation }) {
	const { camera } = useThree();

	useEffect(() => {
		const isAbolute = _.get( deviceOrientation, "absolute" );
		let x, y, z;
		// z from three.js is east-west, increasing leans toward west
		// x from three.js is north-south, increasing leans toward south
		// y from three.js is rotation, positive counter-clockwise

		if ( isAbolute ) {
			// in this frame of reference:
			// z from device appears to be rotation around vertical
			// x from device is east-west lean, postive toward east
			// y from device is north-south lean, positive toward north
			// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained

			y = 360 - ( _.get( deviceOrientation, "webkitCompassHeading" ) || _.get( deviceOrientation, "z" )); 
			z = _.get( deviceOrientation, "x" ) * -1; 
			x = _.get( deviceOrientation, "y" ) * -1; 

		}
		else {
			// in this frame, device is at 0 0 0 when its on its back, screen up, top pointing north
			// x is 90 when device is vertical, back toward north

			y = 360 - ( _.get( deviceOrientation, "webkitCompassHeading" ) || _.get( deviceOrientation, "y" ));
	
			const tilt = _.get( deviceOrientation, "x" ) - 90;
			z = Math.sin( toRadians( y )) * tilt * -1;
			x = Math.cos( toRadians( y )) * tilt * -1; 

		}

		if ( y ) camera.rotation.y = toRadians( y );
		if ( x ) camera.rotation.x = toRadians( x );
		if ( z ) camera.rotation.z = toRadians( z );
	}, [ deviceOrientation ]);

	return null;
});
Camera.propTypes = {
	deviceOrientation: PropTypes.object,
};

export {
	Entities,
	Camera,
};

const toRadians = degrees => degrees * Math.PI / 180;
