
// Packages
import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import * as THREE from "three";
import { useThree } from "react-three-fiber";

// App

const ThreeRenderer = React.memo( function ThreeRenderer ({ processedDives, deviceOrientation, theme }) {
	const { camera } = useThree();

	// const [ rotationIntervalId, setRotationIntervalId ] = useState( false );
	const [ meshYRotationDegrees ] = useState( 0 );

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
			x = Math.cos( toRadians( y )) * tilt; 

		}

		if ( y ) camera.rotation.y = toRadians( y );
		if ( x ) camera.rotation.x = toRadians( x );
		if ( z ) camera.rotation.z = toRadians( z );
	}, [ deviceOrientation ]);

	const mainMarkers = useMemo(() => _.compact( _.flatMap( processedDives, "coords.main" )), [ processedDives ]);
	const journeyMarkers = useMemo(() => _.compact( _.flatMap( processedDives, "coords.journey" )), [ processedDives ]);
	
	const areas = useMemo(() => _.compact( _.map( _.filter( processedDives, { type: "area" }), "coords.main" )), [ processedDives ]);
	const routes = useMemo(() => _.compact( _.map( _.filter( processedDives, { type: "route" }), dive => {
		const coords = _.get( dive, "coords.main" );

		const starting = _.head( coords );
		const startingX = _.get( starting, "x" );
		const startingZ = _.get( starting, "z" );

		const points = _.map( coords, point => new THREE.Vector3( point.x - startingX, 0, point.z - startingZ ));

		return {
			lineGeometry: new THREE.BufferGeometry().setFromPoints( points ),
			start: [ startingX, -1, startingZ ],
		};
	})), [ processedDives ]);

	const journeys = useMemo(() => _.compact( _.map( _.filter( processedDives, { type: "route" }), dive => {
		const coords = _.compact( _.concat( _.get( dive, "coords.journey" ), _.get( dive, "coords.main[0]" )));

		const starting = _.head( coords );
		const startingX = _.get( starting, "x" );
		const startingZ = _.get( starting, "z" );

		const points = _.map( coords, point => new THREE.Vector3( point.x - startingX, 0, point.z - startingZ ));

		return {
			lineGeometry: new THREE.BufferGeometry().setFromPoints( points ),
			start: [ startingX, -1, startingZ ],
		};
	})), [ processedDives ]);

	// useEffect(() => {
	// 	if ( !rotationIntervalId ) setRotationIntervalId( setInterval(() => setMeshYRotationDegrees( y => y + 1 ), 10 ));

	// 	return () => {
	// 		if ( rotationIntervalId ) clearInterval( rotationIntervalId );
	// 	};
	// }, [ rotationIntervalId ]);

	const meshYRotationRads = meshYRotationDegrees * Math.PI / 180;

	return <>
		<pointLight position={[ 5, 5, 5 ]} />
		{ !_.isEmpty( mainMarkers ) && _.map( mainMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, -1, z ]} rotation={[ 0, meshYRotationRads, 0 ]}> 
				<octahedronGeometry />
				<meshStandardMaterial color={ theme.palette.green.main } />
			</mesh>
		)) }
		{ !_.isEmpty( journeyMarkers ) && _.map( journeyMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, -1, z ]} rotation={[ 0, meshYRotationRads, 0 ]}>
				<octahedronGeometry />
				<meshStandardMaterial color={ theme.palette.purple.main } emissiveIntensity={ 0.25 } roughness={ 0.8 } />
			</mesh>
		)) }
		{ !_.isEmpty( routes ) && _.map( routes, ({ lineGeometry, start } , i ) => {
			return (
				<group position={ start }>
					<line geometry={ lineGeometry } key={ i }>
						<lineBasicMaterial attach="material" color={ theme.palette.green.main } />
					</line>
				</group>
			);
		})}
		{ !_.isEmpty( journeys ) && _.map( journeys, ({ lineGeometry, start } , i ) => {
			return (
				<group position={ start }>
					<line geometry={ lineGeometry } key={ i }>
						<lineBasicMaterial attach="material" color={ theme.palette.purple.main } />
					</line>
				</group>
			);
		})}
		{ !_.isEmpty( areas ) && null }
	</>;
});
ThreeRenderer.propTypes = {
	processedDives: PropTypes.array,
	deviceOrientation: PropTypes.object,
	theme: PropTypes.object,
};

export default ThreeRenderer;

const toRadians = degrees => degrees * Math.PI / 180;