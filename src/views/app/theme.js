
import React from "react";
import PropTypes from "prop-types";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";


const theme = createMuiTheme({
	palette: {
		primary: {
			main: "#035AA6",
		},
	},
});

export default function Theme ({ children }) { 
	return <ThemeProvider theme={ theme }>{ children && children }</ThemeProvider>;
}
Theme.propTypes = {
	children: PropTypes.node,
};
