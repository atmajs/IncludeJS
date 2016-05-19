var isWeb = !! (typeof location !== 'undefined' && location.protocol && /^https?:/.test(location.protocol)),
	reg_subFolder = /([^\/]+\/)?\.\.\//,
	reg_hasProtocol = /^(file|https?):/i,
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
