import React from "react";
import { hydrate, render } from "react-dom";
import "./index.scss";
import { App } from "./views/index";
import { register } from "./serviceWorker";

const rootElement = document.getElementById( "root" );
if ( rootElement.hasChildNodes()) {
	hydrate( 
		<React.StrictMode>
			<App />
		</React.StrictMode>, 
		rootElement, 
	);
} else {
	render( 
		<React.StrictMode>
			<App />
		</React.StrictMode>, 
		rootElement, 
	);
}

register();
