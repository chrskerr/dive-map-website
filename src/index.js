import React from "react";
import { hydrate, render } from "react-dom";
import "./css/normalise.css";
import { App } from "./views/index";

const rootElement = document.getElementById( "root" );
if ( rootElement.hasChildNodes()) {
	hydrate( <App />, rootElement );
} else {
	render( <App />, rootElement );
}
