
// Packages
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// App
import SignUp from "./sign-up";
import SignIn from "./sign-in";

const useStyles = makeStyles( theme => ({
	root: {
		marginBottom: theme.spacing( 4 ),
		border: `2px ${ theme.palette.primary.main } solid`,
		borderRadius: theme.shape.borderRadius,
	},
	indicator: {
		display: "none",
	},
	tab: {
		color: `${ theme.palette.primary.main } !important`,
	},
	selected: {
		backgroundColor: theme.palette.primary.main,
		color: `${ theme.palette.common.white } !important`,
	},
}));

export default function AuthComponent ({ closeModal }) {
	const classes = useStyles();
	const [ view, setView ] = useState( "sign-in" );

	return (
		<div>
			<Tabs
				classes={{ root: classes.root, indicator: classes.indicator }}
				value={ view }
				onChange={ ( e, val ) => setView( val ) }
				indicatorColor="primary"
				textColor="primary"
				variant="fullWidth"
				aria-label="full width tabs for Sign In and Sign Up"
			>
				<Tab classes={{ root: classes.tab, selected: classes.selected }} disableRipple label="Sign In" value="sign-in" { ...a11yProps( 0 ) } />
				<Tab classes={{ root: classes.tab, selected: classes.selected }} disableRipple label="Sign Up" value="sign-up" { ...a11yProps( 1 ) } />
			</Tabs>
			{ view === "sign-in" ? <SignIn closeModal={ closeModal } /> : <SignUp closeModal={ closeModal } /> }
		</div>
	);
}
AuthComponent.propTypes = {
	closeModal: PropTypes.func,
};

const a11yProps = index => ({
	id: `full-width-tab-${ index }`,
	"aria-controls": `full-width-tabpanel-${ index }`,
});
