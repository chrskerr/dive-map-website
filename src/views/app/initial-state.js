
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
};
