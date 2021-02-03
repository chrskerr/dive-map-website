
// Packages
import React, { useState, useContext } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography, Drawer, List, ListItem, ListItemAvatar, ListItemText, Modal, Paper } from "@material-ui/core";
import { MenuRounded, AssignmentIndRounded, HomeRounded, ExploreRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";

// App
import { State, SignIn, Join } from "../";

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
		top: "35%",
		left: "30%",
		right: "30%",
	},
	paper: {
		padding: "2rem 3rem",
	},
});

export default function TopNav () {
	const history = useHistory();
	const location = useLocation();

	const classes = useStyles();

	const [ state ] = useContext( State );
	const [ isDrawerOpen, setIsDrawerOpen ] = useState( false );
	const [ accountMenuRef, setAccountMenuRef ] = useState( false );
	const [ openModal, setOpenModal ] = useState( false );

	const isAuthenticated = _.get( state, "auth.isAuthenticated" );
	const signOut = _.get( state, "auth.signOut" );

	const handleOpenModal = modal => {
		setOpenModal( modal );
		setIsDrawerOpen( false );
		setAccountMenuRef( false );
	};

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
					<IconButton
						aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true"
						onClick={ e => setAccountMenuRef( e.currentTarget ) }
						color="inherit"
					>
						<AssignmentIndRounded />
					</IconButton>
				</Toolbar>
			</AppBar>

			<Modal
				open={ Boolean( openModal ) } 
				onClose={ () => setOpenModal( false ) }	
			>
				<div className={ classes.modal }>
					<Paper className={ classes.paper }>
						{ openModal === "sign-in" && <SignIn closeModal={ () => setOpenModal( false ) } /> }
						{ openModal === "join" && <Join closeModal={ () => setOpenModal( false ) } /> }
					</Paper>
				</div>
			</Modal>

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

			<Menu id="menu-appbar-accounts" anchorEl={ accountMenuRef } keepMounted
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={ Boolean( accountMenuRef ) }
				onClose={ () => setAccountMenuRef( null )}
			>
				{ isAuthenticated ? 
					<div>
						<MenuItem onClick={ () => history.push( "/account" ) }>Profile</MenuItem>
						<MenuItem onClick={ signOut }>Sign Out</MenuItem>
					</div>
					: 
					<div>
						<MenuItem onClick={ () => handleOpenModal( "join" ) }>Create Account</MenuItem>
						<MenuItem onClick={ () => handleOpenModal( "sign-in" ) }>Sign In</MenuItem>
					</div>
				}
			</Menu>
		</div>
	);
}
