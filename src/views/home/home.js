
// Packages
import React from "react";
// import _ from "lodash";
import { Typography, Grid, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// App

const useClasses = makeStyles( theme => ({
	root: {
		padding: theme.spacing( 2 ),
	},
	paper: {
		paddingTop: theme.spacing( 2 ), 
		paddingRight: theme.spacing( 2 ), 
		paddingLeft: theme.spacing( 2 ), 
		background: theme.palette.grey[ 100 ],
	},
	text: {
		paddingBottom: theme.spacing( 2 ), 
		fontSize: "85%", 
	},
}));

export default function Home () {
	const classes = useClasses();

	return (
		<div className={ classes.root }>
			<Grid container spacing={ 3 }>
				<Grid item xs={ 12 }>
					<Paper className={ classes.paper }>
						<Typography className={ classes.text }>Jellyfish is a wiki-style, community space to maintain information about the best places to snorkel, freedive and scuba.</Typography>
					</Paper>
				</Grid>
				<Grid item xs={ 12 }>
					<Paper className={ classes.paper }>
						<Typography className={ classes.text }>I made this site because I just started to freedive and couldn&apos;t work out where to dive near my home in Manly!</Typography>
						<Typography className={ classes.text }>I felt that this information is held within the community and is for the use of the community, so this website is designed to allow people to upload, manage and maintain dive information for the broader community to help enjoy this sport safely and happily.</Typography>
					</Paper>
				</Grid>

			</Grid>
		</div>
	);
}
