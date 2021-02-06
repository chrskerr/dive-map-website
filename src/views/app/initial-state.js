
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
