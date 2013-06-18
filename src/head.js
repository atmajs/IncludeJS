(function (root, factory) {
    'use strict';

	var _global, _exports, _document;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	
	_document = _global.document;
	_exports = root || _global;
    
	
	factory(_global, _exports, _document);

}(this, function (global, exports, document) {
    'use strict';
