(function (root, factory) {
    'use strict';

	var _global, _exports;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	if (typeof include !== 'undefined' && typeof include.js === 'function') {
		// allow only one `include` per application
		_exports.include = include;
		_exports.includeLib = include.Lib || _global.includeLib;
		return;
	}
	
	factory(_global, _exports, _global.document);

}(this, function (global, exports, document) {
    'use strict';
