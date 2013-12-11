
/**
 *	.cfg
 *		: path :=	root path. @default current working path, im browser window.location;
 *		: eval := in node.js this conf. is forced
 *		: lockedToFolder := makes current url as root path
 *			Example "/script/main.js" within this window.location "{domain}/apps/1.html"
 *			will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
 */

var bin = {
		js: {},
		css: {},
		load: {}
	},
	isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
	reg_subFolder = /([^\/]+\/)?\.\.\//,
	cfg = {
		path: null,
		loader: null,
		version: null,
		lockedToFolder: null,
		sync: null,
		eval: document == null
	},
	handler = {},
	hasOwnProp = {}.hasOwnProperty,
	emptyResponse = {
		load: {}
	},
	__array_slice = Array.prototype.slice,
	
	XMLHttpRequest = global.XMLHttpRequest;

	