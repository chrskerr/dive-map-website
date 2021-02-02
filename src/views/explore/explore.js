
// Packages
import React from "react";
import { useParams } from "react-router-dom";
// import _ from "lodash";
// import { makeStyles } from "@material-ui/core/styles";

// App


// const useStyles = makeStyles({
// 	root: {
// 		maxWidth: "100vw", maxHeight: "100vh",
// 		width: "100vw", height: "100vh",
// 		display: "flex", flexDirection: "column",
// 	},
// });


export default function Explore () {
	const { dive } = useParams();

	return dive ? <p>View This Dive</p> : <p>Explore All Dives</p>;
}
