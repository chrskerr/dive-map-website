
export default {
	auth: {
		token: null,
		hasHasuraClaims: false,
		client: null,
		persistor: null,
		isAuthenticating: false,
		isAuthenticated: false,
		signIn: () => {},
		createAccount: () => {},
		signOut: () => {},
	},
	ui: {
		breakpoint: null,
		isSmall: false,
		viewHeight: 0,
		deviceType: {
			isDesktop: false,
			isMobile: false,
			isIos: false,
			isDesktAndroid: false,
		},
	},
	user: {
		id: "",
		uid: "",
		username: "",
		email: "",
	},
	explore: {
		view: "viewAll",
		coordsEdited: false,
		dive: {
			id: "",
			depth: 0,
			name: "", 
			type: "",
			description: "", 
			coords: {}, 
			dive_plan: "", 
			created_at: "", 
			updated_at: "",
		},
		map: {
			bounds: {},
			map: null,
			markerPositionType: "main",
			isFlying: true,
			requestFunc: null,
			requestingMarkerType: false,
		},
	},
};
