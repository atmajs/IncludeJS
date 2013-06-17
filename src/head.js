(function (root, factory) {
    'use strict';

    var doc;

    if (typeof exports !== 'undefined' && (root === exports || root == null)){

    	root = global;

    }else{
    	
    	if (root == null) {
			root = typeof window === 'undefined' || doc == null ? global : window;
		}

		doc = typeof document !== 'undefined' ? document : null;
    }

	
	
	factory(root, doc);

}(this, function (global, document) {
    'use strict';
