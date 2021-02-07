
// Packages
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { Paper, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { MapContainer, TileLayer, MapConsumer, Marker, Tooltip, Polygon, Polyline } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import L from "leaflet";
import "leaflet.offline";
import "leaflet.locatecontrol";
import greenIcon from "./leaflet-icon/marker-icon-2x-green-#2AAD27.png";
import violetIcon from "./leaflet-icon/marker-icon-2x-violet-#9C2BCB.png";
import shadow from "./leaflet-icon/marker-shadow.png";


// App

const useStyles = makeStyles( theme => ({
	map: {
		height: "100%", width: "100%",
		minHeight: "100px",
	},
	controls: {
		position: "absolute", zIndex: 1000,
		bottom: theme.spacing( 3 ), left: theme.spacing( 3 ),
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


export default function Map ({ allDives, reducerBag }) {
	const classes = useStyles();
	const [ state, dispatch ] = reducerBag;	
	const [ isZooming, setIsZooming ] = useState( false );

	// Location search
	const [ searchProvider ] = useState( new GeoSearchControl({ 
		provider: new OpenStreetMapProvider(),
		showMarker: false,
		style: "bar",
	}));

	// Edit
	const isAddEditActive = _.get( state, "addEdit.isActive" );
	const isAddEditRequesting = _.get( state, "addEdit.isRequesting" );

	// Dive markers
	const iconProps = {
		iconSize: [ 25, 41 ],
		iconAnchor: [ 12, 41 ],
		popupAnchor: [ 1, -34 ],
		shadowSize: [ 41, 41 ],
	};
	const [ icons ] = useState({
		green: new L.Icon({
			iconUrl: greenIcon,
			shadowUrl: shadow,
			...iconProps,
		}),
		violet: new L.Icon({
			iconUrl: violetIcon,
			shadowUrl: shadow,
			...iconProps,
		}),
	});
	const diveMarkers = isAddEditActive ? _.get( state, "addEdit.coords" ) : _.get( state, "currentDive.coords" );
	const diveType = isAddEditActive ? _.get( state, "addEdit.diveType" ) : _.get( state, "currentDive.type" );
	const journeyLatLngs = _.get( diveMarkers, "journey" );
	const mainLatLngs = _.get( diveMarkers, "main" );
	const markerPositionType = _.get( state,  "map.markerPositionType" );

	return <>
		{ _.isEmpty( mainLatLngs ) && <div className={ classes.controls }>
			<Paper className={ classes.paper }>
				<FormControl component="fieldset">
					<FormLabel className={ classes.label } component="legend">Where should the markers be displayed?</FormLabel>
					<RadioGroup aria-label="gender" name="gender1" value={ markerPositionType } onChange={ e => dispatch({ type: "map.setMarkerPositionType", markerPositionType: e.target.value })}>
						<FormControlLabel className={ classes.controlLabel } value="journey" control={ <Radio color="primary" /> } label="Departure point" />
						<FormControlLabel className={ classes.controlLabel } value="main" control={ <Radio color="primary" /> } label="Descent point" />
					</RadioGroup>
				</FormControl>
			</Paper>
		</div> }
		<MapContainer className={ classes.map } center={[ 15, 15 ]} zoom={ 1.75 }>
			<MapConsumer>
				{ map => {
					const bounds = _.get( state, "map.bounds" );

					const updateBounds = _.debounce(() => {
						const newMap = map.invalidateSize();
						const boundsObj = newMap.getBounds();
						const newBounds = {
							lat0: _.get( boundsObj, "_southWest.lat" ),
							lat1: _.get( boundsObj, "_northEast.lat" ),
							lng0: _.get( boundsObj, "_southWest.lng" ),
							lng1: _.get( boundsObj, "_northEast.lng" ),
						};
						if ( !_.isEqual( bounds, newBounds )) dispatch({ type: "map.setBounds", bounds: newBounds, map });
					}, 500 );
	
					useEffect(() => {
						if ( _.isEmpty( bounds )) updateBounds();
					}, [ bounds ]);
	
					useEffect(() => { 
						map.on( "zoomstart", () => setIsZooming( true ));
						map.on( "zoomend", () => {
							setIsZooming( false );
							updateBounds();
						});
						map.on( "moveend", () => updateBounds());
						map.on( "resize", () => updateBounds());
						map.addControl( searchProvider );
						map.addControl( L.control.locate({
							locateOptions: {
								enableHighAccuracy: true,
								watch: true,
							},
						}));

						setTimeout(() => map.invalidateSize(), 50 );
					}, []);



					useEffect(() => {
						if ( !_.isEmpty( mainLatLngs ) && !isAddEditActive ) { 
							map.flyTo( _.head( mainLatLngs ), 14 );
						}
					}, [ mainLatLngs, isAddEditActive ]);

					useEffect(() => {
						if ( isAddEditRequesting ) map.on( "dblclick", ({ latlng }) => dispatch({ type: "addEdit.supplyMarker", latlng }));
						else map.off( "dblclick" );
					}, [ isAddEditRequesting ]);
	
					return <>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
							url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
						/> 
						{ ( !_.isEmpty( allDives ) && !isAddEditActive ) && _.map( allDives, dive => {
							const lat = _.get( dive, `coords.${ markerPositionType }[0].lat` ) || _.get( dive, "coords.main[0].lat" );
							const lng = _.get( dive, `coords.${ markerPositionType }[0].lng` ) || _.get( dive, "coords.main[0].lng" );
							if ( !lat || !lng ) return null;

							return (
								<Marker position={[ lat, lng ]} key={ _.get( dive, "id" ) }>
									<Tooltip>{ _.get( dive, "name" ) }</Tooltip>
								</Marker>
							);
						})}
						{ ( !_.isEmpty( journeyLatLngs ) && !isZooming ) && <>
							<Polyline positions={ _.compact( _.concat( journeyLatLngs, _.head( mainLatLngs ))) } color="#9C2BCB" />
							{ _.map( journeyLatLngs, ( latLngs, index ) => {
								const { lat, lng } = latLngs; 
								return (
									<Marker 
										key={ index } 
										position={[ lat, lng ]}
										draggable={ isAddEditActive }
										icon={ icons.violet }
										eventHandlers={ isAddEditActive ? {
											dragend: e => {
												const { lat, lng } = _.get( e, "target._latlng" );
												dispatch({ type: "addEdit.editCoord", coordType: "journey", index, latLng: { lat, lng }});
											},
										} : {}}
									>
										<Tooltip>Journey: Marker #{ index + 1 }</Tooltip>
									</Marker>
								);
							})}
						</>
						}
						{ ( !_.isEmpty( mainLatLngs ) && !isZooming ) && <>
							{ diveType === "area" && <Polygon positions={ mainLatLngs } color="#2AAD27" /> }
							{ diveType === "route" && <Polyline positions={ mainLatLngs } color="#2AAD27" /> }
							{ _.map( mainLatLngs, ( latLngs, index ) => {
								const { lat, lng } = latLngs; 
								return (
									<Marker 
										key={ index } 
										position={ [ lat, lng ] }
										draggable={ isAddEditActive }
										icon={ icons.green }
										eventHandlers={ isAddEditActive ? {
											dragend: e => {
												const { lat, lng } = _.get( e, "target._latlng" );
												dispatch({ type: "addEdit.editCoord", coordType: "main", index, latLng: { lat, lng }});
											},
										} : {}}
									>
										<Tooltip>{ _.startCase( diveType )}: Marker #{ index + 1 }</Tooltip>
									</Marker>
								);
							}) }
						</>
						}
					</>;
				}}
			</MapConsumer>
		</MapContainer>
	</>;

}
Map.propTypes = {
	allDives: PropTypes.array,
	reducerBag: PropTypes.array,
};
