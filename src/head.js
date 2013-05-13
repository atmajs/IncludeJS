(function (factory) {
    'use strict';

	var root, doc;
	
    if (typeof window !== 'undefined' && typeof document !== 'undefined'){
		root = window;
        doc = document;
    } else {
		root = global;
	}
	
	
	factory(root, doc);

}(function (global, document) {
    'use strict';
