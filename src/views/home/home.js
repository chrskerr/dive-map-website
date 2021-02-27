
// Packages
import React, { useContext } from "react";
import _ from "lodash";
import { Typography, Grid, Paper, Container, Button } from "@material-ui/core";
import { ChevronRightRounded } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

// App
import { Icon, State } from "../";

const useClasses = makeStyles( theme => ({
	root: {
		padding: theme.spacing( 2 ),
		paddingTop: ({ breakpoint }) => breakpoint === "xs" ? theme.spacing( 4 ) : theme.spacing( 8 ),
		overflow: "scroll",
	},
	paper: {
		padding: theme.spacing( 2 ), 
		height: "100%",
		display: "flex",
		flexDirection: "column",
		"& .-icon-button-container": {
			width: "100%",
			display: "flex",
			justifyContent: "flex-end",
			alignItems: "flex-end",
			flexGrow: 1,
			paddingTop: theme.spacing( 1 ),
		},
	},
	container: {
		marginBottom: theme.spacing( 4 ),
	},
	headerContainer: {
		display: "flex",
		marginBottom: theme.spacing( 6 ),
		flexDirection: ({ breakpoint }) => breakpoint === "xs" ? "column" : "row",
		"& :first-child": {
			marginRight: theme.spacing( 4 ),
			marginBottom: ({ breakpoint }) => breakpoint === "xs" ? theme.spacing( 2 ) : 0,
		},
	},
	text: {
		fontSize: "95%", 
		textAlign: "justify",
	},
}));

export default function Home () {
	const [ state ] = useContext( State );

	const classes = useClasses({ breakpoint: _.get( state, "ui.breakpoint" ) });
	const history = useHistory();

	return (
		<div className={ classes.root }>
			<Container className={ classes.headerContainer } maxWidth="md">
				<Icon style="jellyfish-blue" size="xlarge" />
				<div>
					<Typography variant="h2">Jellyfish</Typography>
					<Typography variant="h4">A scuba, freedive and snorkel site sharing site</Typography>
				</div>
			</Container>
			<Container maxWidth="md" className={ classes.container }>
				<Typography>Jellyfish is an openly editable, community space to maintain information about the best places to snorkel, freedive and scuba.</Typography>
			</Container>
			<Container maxWidth="md">
				<Grid container spacing={ 3 }>
					<Grid item sm={ 4 } xs={ 12 }>
						<Paper variant="outlined" square className={ classes.paper } onClick={ () => history.push( "/explore" )}>
							<Typography variant="subtitle2" gutterBottom>Why?</Typography>
							<Typography className={ classes.text } gutterBottom>I made this site because I just started to freedive and couldn&apos;t work out where to dive near my home in Manly!</Typography>
							<Typography className={ classes.text }>I feel that the knowledge is spread within the community and would benefit everyone by being more open and available.</Typography>
						</Paper>
					</Grid>
					<Grid item sm={ 4 } xs={ 12 }>
						<Paper variant="outlined" square className={ classes.paper }>
							<Typography variant="subtitle2" gutterBottom>Mapping / Explore</Typography>
							<Typography className={ classes.text }>The world map lets you zoom to explore community created dive sites, edit publicly available sites and add new dive sites for others to enjoy.</Typography>
							<div className="-icon-button-container">
								<Button 
									size="small"
									variant="outlined"
									aria-label="go-to-mapping"
									endIcon={ <ChevronRightRounded /> }
									onClick={ () => history.push( "/explore" )}
								>Go</Button>
							</div>
						</Paper>
					</Grid>
					<Grid item sm={ 4 } xs={ 12 }>
						<Paper variant="outlined" square className={ classes.paper }>
							<Typography variant="subtitle2" gutterBottom>Augmented Reality / Locate</Typography>
							<Typography className={ classes.text } gutterBottom>This (very experiental) feature is design to show nearby dive sites on the camera of a mobile device to help you understand how they are placed relative to your current location.</Typography>
							<Typography className={ classes.text }>This is still under heavy development to get working.</Typography>
							<div className="-icon-button-container">
								<Button 
									size="small"
									variant="outlined"
									aria-label="go-to-augmented-reality"
									endIcon={ <ChevronRightRounded /> }
									onClick={ () => history.push( "/locate" )}
								>Go</Button>
							</div>
						</Paper>
					</Grid>
				</Grid>
			</Container>
		</div>
	);
}
