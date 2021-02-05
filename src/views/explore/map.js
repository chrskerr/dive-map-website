
// Packages
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { MapContainer, TileLayer, MapConsumer, Marker, Popup } from "react-leaflet";
import { Paper, FormGroup, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// App

const useStyles = makeStyles( theme => ({
	map: {
		height: "100%", width: "100%",
		minHeight: "100px",
	},
	controls: {
		position: "absolute", zIndex: 10000,
		bottom: theme.spacing( 3 ), right: theme.spacing( 1 ),
		"& .MuiTypography-root, & .MuiFormLabel-root": {
			fontSize: "80%",
			color: theme.palette.grey[ "800" ],
		},
	},
	paper: {
		padding: theme.spacing( 2 ),
	},
	label: {
		marginBottom: theme.spacing( 0.5 ),
	},
	useGps: {
		marginTop: theme.spacing( -1.5 ),
		marginBottom: theme.spacing( 1 ),
	},
	controlLabel: {
		marginBottom: theme.spacing( -1.5 ),
	},
}));

export default function Map ({ emitBounds, markers }) {
	const classes = useStyles();
	
	const [ markerPositionType, setMarkerPositionType ] = useState( "start" );
	const [ bounds, setBounds ] = useState({});

	// Location search
	const [ searchProvider ] = useState( new GeoSearchControl({ 
		provider: new OpenStreetMapProvider(),
		showMarker: false,
		style: "bar",
	}));

	// GPS
	const [ useGPS, setUseGPS ] = useState( false );
	const [ geoHandlerId, setGeoHandlerId ] = useState( false );
	const [ userCoords, setUserCoords ] = useState( false );
	useEffect(() => {
		if ( useGPS && !geoHandlerId ) navigator.geolocation.watchPosition(({ coords }) => {
			if ( !_.isEqual( coords, userCoords )) setUserCoords( coords );
		});
		if ( !useGPS && geoHandlerId ) clearGeoHandler();
		return clearGeoHandler;
	}, [ useGPS, geoHandlerId ]);
	const clearGeoHandler = () => {
		navigator.geolocation.clearWatch( geoHandlerId );
		setGeoHandlerId( false );
	};

	return <>
		<div className={ classes.controls }>
			<Paper className={ classes.paper }>
				<FormGroup>
					<FormControlLabel className={ classes.useGps } control={
						<Switch
							checked={ useGPS }
							onChange={ e => {
								e.preventDefault();
								setUseGPS( !useGPS );
							} }
							color="primary"
							name="useGPS"
							inputProps={{ "aria-label": "use my GPS switch" }}
						/> }
					label="Use my GPS?"
					/>
				</FormGroup>
				<FormControl component="fieldset">
					<FormLabel className={ classes.label } component="legend">Where should the markers be displayed?</FormLabel>
					<RadioGroup aria-label="gender" name="gender1" value={ markerPositionType } onChange={ e => setMarkerPositionType( e.target.value )}>
						<FormControlLabel className={ classes.controlLabel } value="start" control={ <Radio color="primary" /> } label="Departure point" />
						<FormControlLabel className={ classes.controlLabel } value="decend" control={ <Radio color="primary" /> } label="Decent point" />
					</RadioGroup>
				</FormControl>
			</Paper>
		</div>
		<MapContainer className={ classes.map } center={[ 15, 15 ]} zoom={ 1.75 }>
			<MapConsumer>
				{ map => {
					const updateBounds = () => {
						const newMap = map.invalidateSize();
						const boundsObj = newMap.getBounds();
						const newBounds = {
							lat0: _.get( boundsObj, "_southWest.lat" ),
							lat1: _.get( boundsObj, "_northEast.lat" ),
							lng0: _.get( boundsObj, "_southWest.lng" ),
							lng1: _.get( boundsObj, "_northEast.lng" ),
						};
						if ( !_.isEqual( bounds, newBounds )) {
							setBounds( newBounds );
							emitBounds( newBounds );
						} 
					};
	
					useEffect(() => {
						if ( _.isEmpty( bounds )) updateBounds();
					}, [ bounds ]);
	
					useEffect(() => { 
						setTimeout(() => map.invalidateSize(), 150 );
						map.on( "zoomend", () => updateBounds());
						map.on( "moveend", () => updateBounds());
						map.on( "resize", () => updateBounds());
						map.addControl( searchProvider );
					}, []);
	
					return <>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
							url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
						/> 
						{ !_.isEmpty( markers ) && _.map( markers, marker => {
							const { lat, lng } = _.get( marker, [ "location", markerPositionType ]);
	
							return  <Marker position={ [ lat, lng ] }>
								<Popup>
				A pretty CSS3 popup. <br /> Easily customizable.
								</Popup>
							</Marker>;
						})}
					</>;
				}}
			</MapConsumer>
		</MapContainer>
	</>;

}
Map.propTypes = {
	emitBounds: PropTypes.func,
	markers: PropTypes.array,
};
