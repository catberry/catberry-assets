'use strict';

const PostBuildAction = require('./lib/PostBuildAction');

module.exports = {
	register(locator) {
		locator.register('postBuildAction', PostBuildAction, true);
	}
};
