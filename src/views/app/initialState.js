
export default {
	auth: {
		token: null,
		client: null,
		persistor: null,
		isAuthenticating: true,
		isAuthenticated: false,
		signIn: () => {},
		createAccount: () => {},
		signOut: () => {},
	},
	ui: {
		breakpoint: null,
	},
};
