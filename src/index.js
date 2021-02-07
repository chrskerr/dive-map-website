import React from "react";
import { hydrate, render } from "react-dom";
import "./css/normalise.css";
import "./css/icomoon-fa-v1.0/style.css";
import "../node_modules/leaflet-geosearch/dist/geosearch.css";
import "../node_modules/leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { App } from "./views/index";

const rootElement = document.getElementById( "root" );
if ( rootElement.hasChildNodes()) {
	hydrate( <App />, rootElement );
} else {
	render( <App />, rootElement );
}
