
// Packages
import React, { useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
// import L from "leaflet";
import { MapContainer, TileLayer, MapConsumer, ScaleControl, Marker, Tooltip, Polygon, Polyline } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
// import { CachedTileLayer } from "@yaga/leaflet-cached-tile-layer";
import DivIcon from "leaflet-svgicon";
// import "leaflet.locatecontrol";
import "../../../node_modules/leaflet/dist/leaflet.css";
import "../../../node_modules/leaflet-geosearch/dist/geosearch.css";
// import "../../../node_modules/leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "../../css/icomoon-fa-v1.0/style.css";

// App
import { State } from "../";

const useStyles = makeStyles({
	map: {
		height: "100%", width: "100%",
		minHeight: "100px",
	},
});


export default function Map ({ allDives }) {
	const classes = useStyles();
	const [ state, dispatch ] = useContext( State );	
	const history = useHistory();
	
	const isSmall = _.get( state, "ui.isSmall" );

	// Location search
	const [ searchProvider ] = useState( new GeoSearchControl({ 
		provider: new OpenStreetMapProvider(),
		showMarker: false,
		style: "bar",
	}));

	// Edit
	const view = _.get( state, "explore.view" );
	const isEditing = view === "add" || view === "edit";
	const isRequesting = _.isFunction( _.get( state, "explore.map.requestFunc" ));

	// Dive markers
	const diveMarkers = _.get( state, "explore.dive.coords" );
	const diveType = _.get( state, "explore.dive.type" );
	const journeyLatLngs = _.get( diveMarkers, "journey" );
	const mainLatLngs = _.get( diveMarkers, "main" );
	const markerPositionType = _.get( state,  "explore.map.markerPositionType" );
	const isFlying = _.get( state, "explore.map.isFlying" );

	return (
		<MapContainer className={ classes.map } center={ isSmall ? [ 24, 15 ] : [ 15, 15 ] } zoom={ isSmall ? 0.75 : 1.75 }>
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
						// new CachedTileLayer( "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
						// 	attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
						// 	databaseName: "tile-cache-data",
						// 	maxAge: 1000 * 60 * 60 * 24 * 7,
						// }).addTo( map );

						map.on( "zoomend", () => {
							dispatch({ type: "map.stopFlying" });
							updateBounds();
						});
						map.on( "moveend", () => updateBounds());
						map.on( "resize", () => updateBounds());
						map.addControl( searchProvider );
						// map.addControl( L.control.locate({
						// 	setView: "once",
						// 	flyTo: true,
						// 	locateOptions: {
						// 		enableHighAccuracy: true,
						// 		watch: true,
						// 	},
						// }));

						setTimeout(() => map.invalidateSize(), 50 );
					}, []);

					useEffect(() => {
						if ( isRequesting ) map.on( "dblclick", ({ latlng }) => dispatch({ type: "addEdit.supplyMarker", latlng }));
						else map.off( "dblclick" );
					}, [ isRequesting ]);
	
					return <>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
							url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
						/> 
						<ScaleControl />
						{ ( !_.isEmpty( allDives ) && ( !isEditing || isFlying )) && _.map( allDives, dive => {
							const lat = _.get( dive, `coords.${ markerPositionType }[0].lat` ) || _.get( dive, "coords.main[0].lat" );
							const lng = _.get( dive, `coords.${ markerPositionType }[0].lng` ) || _.get( dive, "coords.main[0].lng" );
							if ( !lat || !lng ) return null;
							const id = _.get( dive, "id" );

							return (
								<Marker 
									position={[ lat, lng ]} key={ id } 
									icon={ new DivIcon.SVGIcon({ color: "#035AA6" })}
									eventHandlers={{ dblclick: () => history.push( `/explore/${ id }` ) }}
								>
									<Tooltip>{ _.get( dive, "name" ) }</Tooltip>
								</Marker>
							);
						})}
						{ ( !_.isEmpty( journeyLatLngs ) && !isFlying ) && <>
							<Polyline positions={ _.compact( _.concat( journeyLatLngs, _.head( mainLatLngs ))) } color="#9C2BCB" />
							{ _.map( journeyLatLngs, ( latLngs, index ) => {
								const { lat, lng } = latLngs; 
								return (
									<Marker 
										key={ index } 
										position={[ lat, lng ]}
										draggable={ isEditing }
										icon={ new DivIcon.SVGIcon({ color: "#9C2BCB" }) }
										eventHandlers={ isEditing ? {
											drag: e => _.throttle(() => {
												const { lat, lng } = _.get( e, "target._latlng" );
												dispatch({ type: "addEdit.editCoord", coordType: "journey", index, latLng: { lat, lng }});
											}, 20 )(),
											dblclick: () => dispatch({ type: "addEdit.deleteCoord", coordType: "journey", index }),
										} : {}}
									>
										<Tooltip>Journey: Marker #{ index + 1 }</Tooltip>
									</Marker>
								);
							})}
						</>
						}
						{ ( !_.isEmpty( mainLatLngs ) && !isFlying ) && <>
							{ diveType === "area" && <Polygon positions={ mainLatLngs } color="#2AAD27" /> }
							{ diveType === "route" && <Polyline positions={ mainLatLngs } color="#2AAD27" /> }
							{ _.map( mainLatLngs, ( latLngs, index ) => {
								const { lat, lng } = latLngs; 
								return (
									<Marker 
										key={ index } 
										position={ [ lat, lng ] }
										draggable={ isEditing }
										icon={ new DivIcon.SVGIcon({ color: "#2AAD27" }) }
										eventHandlers={ isEditing ? {
											drag: e => _.throttle(() => {
												const { lat, lng } = _.get( e, "target._latlng" );
												dispatch({ type: "addEdit.editCoord", coordType: "main", index, latLng: { lat, lng }});
											}, 20 )(),
											dblclick: () => dispatch({ type: "addEdit.deleteCoord", coordType: "main", index }),
										} : {}}
									>
										<Tooltip>
											<span>{ _.startCase( diveType )}: Marker #{ index + 1 }.</span>
											{ isEditing && <>
												<br /><span>Drag me to relocate.</span>
												<br /><span>Double-click me to delete.</span>
											</> }
										</Tooltip>
									</Marker>
								);
							}) }
						</>
						}
					</>;
				}}
			</MapConsumer>
		</MapContainer>
	);
}
Map.propTypes = {
	allDives: PropTypes.array,
	reducerBag: PropTypes.array,
};
