
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
	isWeb = !! (typeof location !== 'undefined' && location.protocol && /^https?:/.test(location.protocol)),
	reg_subFolder = /([^\/]+\/)?\.\.\//,
	reg_hasProtocol = /^(file|https?):/i,
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

//#if (BROWSER)
var isBrowser = true, isNode = false;
//#endif

//#if (NODE)
var isBrowser = false, isNode = true;
//#endif
