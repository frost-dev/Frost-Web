const HttpServerError = require('./http-server-error');

// required scopes: auth.host, user.read
module.exports = async (req, streamingRest, config) => {

	// validate user credential
	const validResult = await streamingRest.request('get', '/auth/valid_credential', {
		query: { screenName: req.body.screenName, password: req.body.password }
	});
	if (validResult.statusCode != 200) {
		throw new HttpServerError(validResult.statusCode, `session creation error: ${validResult.response.message}`);
	}
	if (validResult.response.valid !== true) {
		throw new HttpServerError(400, 'session creation error: invalid credential');
	}

	const usersResult = await streamingRest.request('get', '/users', {
		query: {
			'screen_names': req.body.screenName
		}
	});
	const user = usersResult.response.users[0];

	const getToken = async (scopes) => {
		let tokenResult = await streamingRest.request('get', '/auth/tokens', {
			query: {
				applicationId: config.web.applicationId,
				userId: user.id,
				scopes: scopes
			}
		});
		if (tokenResult.statusCode != 200 && tokenResult.statusCode != 404) {
			throw new HttpServerError(tokenResult.statusCode, `session creation error: ${tokenResult.response.message}`);
		}
		if (tokenResult.statusCode == 404) {
			tokenResult = await streamingRest.request('post', '/auth/tokens', {
				body: {
					applicationId: config.web.applicationId,
					userId: user.id,
					scopes: config.web.accessTokenScopes.session
				}
			});
			if (tokenResult.statusCode != 200) {
				throw new HttpServerError(tokenResult.statusCode, `session creation error: ${tokenResult.response.message}`);
			}
		}
		return tokenResult.response.token;
	};

	// get session accessToken
	const sessionToken = await getToken(config.web.accessTokenScopes.session);

	// get client-side sccessToken
	const clientSideToken = await getToken(config.web.accessTokenScopes.clientSide);

	req.session.token = sessionToken;
	req.session.clientSideToken = clientSideToken;
};
