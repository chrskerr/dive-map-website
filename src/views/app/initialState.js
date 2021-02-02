
export default {
	auth: {
		token: null,
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
	},
};
