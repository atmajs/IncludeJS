
var cfg = {},
	bin = {},
	isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
	handler = {},
	regexpName = /\{name\}/g,
	hasOwnProp = {}.hasOwnProperty,
	rewrites = typeof IncludeRewrites != 'undefined' ? IncludeRewrites : null,
	currentParent = null,
	__eval = function(source, include) {
		if (!source) console.error('error', include);
		return eval(source);
	};