
// Packages
import React from "react";
// import _ from "lodash";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// App

const useClasses = makeStyles( theme => ({
	root: {
		padding: theme.spacing( 2 ),
	},
}));

export default function Home () {
	const classes = useClasses();

	return (
		<div className={ classes.root }>
			<Grid container spacing={ 3 }>
				<Grid item sm={ 12 }>
					<Typography variant="h3">
						Jelly Fish Dive Finder
					</Typography>
				</Grid>
				<Grid item xs={ 4 }>
					<Typography variant="h5">
						Why:
					</Typography>
				</Grid>
				<Grid item xs={ 8 }>
					<Typography>
						I made this site because I just started to freedive and couldn&apos;t work out where to dive near my home in Manly!
					</Typography>
					<Typography>
						I felt that this information is held within the community and is for the use of the community, so this website is designed to allow people to upload, manage and maintain dive information for the broader community to help enjoy this sport safely and happily.
					</Typography>
				</Grid>
			</Grid>
		</div>
	);
}
