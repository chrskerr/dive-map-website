
// Packages
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { useThree } from "react-three-fiber";
import { useTheme } from "@material-ui/core/styles";

// App


export default function ThreeRenderer ({ processedDives, userCoords, deviceOrientation }) {
	const { camera } = useThree();
	const theme = useTheme();

	useEffect(() => {
		// if ( _.get( deviceOrientation, "z" )) camera.rotation.z = _.get( deviceOrientation, "z" ) * Math.PI / 180 ; 
		if ( _.get( deviceOrientation, "x" )) camera.rotation.x = _.get( deviceOrientation, "x" ) * Math.PI / 180 ;
		if ( _.head( userCoords, "heading" )) camera.rotation.y = _.head( userCoords, "heading" ) * Math.PI / 180 ;
	}, [ deviceOrientation, userCoords ]);

	const mainMarkers = _.compact( _.map( processedDives, "coords.main" ));
	const journeyMarkers = _.compact( _.map( processedDives, "coords.journey" ));

	console.log( mainMarkers, journeyMarkers );

	return <>
		{ !_.isEmpty( mainMarkers ) && _.map( mainMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, 0, z ]}>
				<sphereGeometry args={[ 0.5 ]} />
				<meshBasicMaterial color={ theme.palette.green.main } transparent />
			</mesh>
		)) }
		{ !_.isEmpty( journeyMarkers ) && _.map( journeyMarkers, ({ x, z }, i ) => (
			<mesh key={ i } visible position={[ x, 0, z ]}>
				<sphereGeometry args={[ 0.5 ]} />
				<meshBasicMaterial color={ theme.palette.purple.main } transparent />
			</mesh>
		)) }
	</>;
}
ThreeRenderer.propTypes = {
	processedDives: PropTypes.array,
	userCoords: PropTypes.object,
	deviceOrientation: PropTypes.object,
};
