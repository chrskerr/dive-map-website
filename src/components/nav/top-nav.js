
// Packages
import React, { useState, useContext } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemAvatar, ListItemText, Modal, Paper } from "@material-ui/core";
import { MenuRounded, AssignmentIndRounded, HomeRounded, ExploreRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

// App
import { State, AuthComponent } from "../";

const useStyles = makeStyles({
	root: {
		flexGrow: 0,
	},
	title: {
		flexGrow: 1,
	},
	listItem: {
		width: "16rem",
	},
	modal: {
		position: "absolute",
		top: "20%",
		left: "30%",
		right: "30%",
	},
	paper: {
		padding: "2rem 3rem",
	},
	link: {
		cursor: "pointer",
		color: "white",
	},
});

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
						onClick={ () => setIsDrawerOpen( true ) }
					>
						<MenuRounded />
					</IconButton>
					<Typography variant="h6" className={ classes.title }>Diving Map</Typography>
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
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/" } onClick={ () => handleNavigate( "/" ) }>
						<ListItemAvatar>
							<HomeRounded />
						</ListItemAvatar>
						<ListItemText>
							Home
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/new" } onClick={ () => handleNavigate( "/new" ) }>
						<ListItemAvatar>
							<ExploreRounded />
						</ListItemAvatar>
						<ListItemText>
							Add New Dive Site
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/explore" } onClick={ () => handleNavigate( "/explore" ) }>
						<ListItemAvatar>
							<ExploreRounded />
						</ListItemAvatar>
						<ListItemText>
							Explore
						</ListItemText>
					</ListItem>
					<ListItem className={ classes.listItem } button selected={ selectedDrawerItem === "/account" } onClick={ () => handleNavigate( "/account" ) }>
						<ListItemAvatar>
							<AssignmentIndRounded />
						</ListItemAvatar>
						<ListItemText>
							Account
						</ListItemText>
					</ListItem>
				</List>
			</Drawer>

			<Modal
				open={ isModalOpen } 
				onClose={ () => setIsModalOpen( false ) }	
			>
				<div className={ classes.modal }>
					<Paper className={ classes.paper }>
						<AuthComponent closeModal={ () => setIsModalOpen( false ) } />
					</Paper>
				</div>
			</Modal>
		</div>
	);
}
