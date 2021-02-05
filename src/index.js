import React from "react";
import { hydrate, render } from "react-dom";
import "./css/normalise.css";
import "../node_modules/leaflet-geosearch/dist/geosearch.css";
import { App } from "./views/index";
import { register } from "./serviceWorker";

const rootElement = document.getElementById( "root" );
if ( rootElement.hasChildNodes()) {
	hydrate( <App />, rootElement );
} else {
	render( <App />, rootElement );
}

register();
