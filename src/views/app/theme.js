
import React from "react";
import PropTypes from "prop-types";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { purple, green } from "@material-ui/core/colors";


const theme = createMuiTheme({
	palette: {
		primary: {
			main: "#035AA6",
			light: "#357bb7",
			dark: "#ffa733",
			contrastText: "#FFF",
		},
		secondary: {
			main: "#ff9100",
			light: "#FFBC45",
			dark: "#b26500",
			contrastText: "#000",
		},
		purple: {
			...purple,
			main: purple[ 300 ],
			light: purple[ 100 ],
		},
		green: {
			...green,
			main: green[ 400 ],
			light: green[ 200 ],
		},
	},
});

export default function Theme ({ children }) { 
	return <ThemeProvider theme={ theme }>{ children && children }</ThemeProvider>;
}
Theme.propTypes = {
	children: PropTypes.node,
};
