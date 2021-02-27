
// Packages
import React, { useState, useContext } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemAvatar, ListItemText, Slide, Dialog, DialogContent } from "@material-ui/core";
import { MenuOutlined, AssignmentIndOutlined, HomeOutlined, ExploreOutlined, PhotoCameraOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

// App
import { State, AuthComponent, Icon } from "../";

const useStyles = makeStyles( theme => ({
	root: {
		flexGrow: 0,
	},
	drawerIcon: {
		paddingRight: theme.spacing( 4 ),
	},
	betaText: {
		flexGrow: 1,
		paddingLeft: theme.spacing( 0.5 ),
		marginTop: "4.5px",
		fontStyle: "italic",
		fontSize: "80%",
	},
	titleText: {
		paddingLeft: theme.spacing( 2 ),
	},
	drawerHeading: {
		paddingBottom: theme.spacing( 3 ),
	},
	listItem: {
		width: "16rem",
	},
	dialogContent: {
		padding: theme.spacing( 3 ),
	},
	link: {
		cursor: "pointer",
		color: "white",
	},
}));

export default function TopNav () {
	const history = useHistory();
	const location = useLocation();

	const classes = useStyles();

	const [ state ] = useContext( State );
	const [ isDrawerOpen, setIsDrawerOpen ] = useState( false );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const { isAuthenticated, isAuthenticating } = _.get( state, "auth" );

	const handleNavigate = route => {
		setIsDrawerOpen( false );
		history.push( route );
	};

	const selectedDrawerItem = `/${ _.nth( _.split( _.get( location, "pathname" ), "/" ), 1 ) }`;

	return (
		<div className={ classes.root }>
			<AppBar position="relative">
				<Toolbar variant="dense">
					<IconButton 
						edge="start" color="inherit" aria-label="menu"
						className={ classes.drawerIcon }
						onClick={ () => setIsDrawerOpen( true ) }
					>
						<MenuOutlined />
					</IconButton>
					<Icon style="jellyfish-outlined" colour="#fff" size="small" />
					<Typography variant="h6" className={ classes.titleText }>Jellyfish</Typography>
					<Typography className={ classes.betaText }>beta</Typography>
					{ !isAuthenticating && <>
						{ isAuthenticated ? 
							<Typography className={ classes.link } onClick={ () => history.push( "/account" ) }>Account</Typography>
							: 
							<Typography className={ classes.link } onClick={ () => setIsModalOpen( true )}>Sign In / Sign Up</Typography> 
						}
					</> }
				</Toolbar>
			</AppBar>

			<Drawer open={ isDrawerOpen } onClose={ () => setIsDrawerOpen( false ) }>
				<List>
					<ListItem alignItems="center">
						<Icon style="jellyfish-blue" size="large" />
					</ListItem>
					<ListItem className={ classes.drawerHeading }>
						<Typography variant="h5">Jellyfish</Typography>
						<Typography className={ classes.betaText }>beta</Typography>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/" } onClick={ () => handleNavigate( "/" ) }>
						<ListItemAvatar>
							<HomeOutlined />
						</ListItemAvatar>
						<ListItemText>
							Home
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/explore" } onClick={ () => handleNavigate( "/explore" ) }>
						<ListItemAvatar>
							<ExploreOutlined />
						</ListItemAvatar>
						<ListItemText>
							Explore
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/locate" } onClick={ () => handleNavigate( "/locate" ) }>
						<ListItemAvatar>
							<PhotoCameraOutlined />
						</ListItemAvatar>
						<ListItemText>
							Locate (experimental)
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/account" } onClick={ () => handleNavigate( "/account" ) }>
						<ListItemAvatar>
							<AssignmentIndOutlined />
						</ListItemAvatar>
						<ListItemText>
							Account
						</ListItemText>
					</ListItem>
				</List>
			</Drawer>

			<Dialog
				open={ isModalOpen }
				TransitionComponent={ Transition }
				keepMounted
				onClose={ () => setIsModalOpen( false ) }
				aria-labelledby="dialog-sign-in-sign-up"
				aria-describedby="dialog-sign-in-sign-up"
			>
				<DialogContent className={ classes.dialogContent }>
					<AuthComponent closeModal={ () => setIsModalOpen( false ) } />
				</DialogContent>
			</Dialog>
		</div>
	);
}

const Transition = React.forwardRef( function Transition( props, ref ) {
	return <Slide direction="up" ref={ref} {...props} />;
});
  