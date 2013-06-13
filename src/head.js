(function (root, factory) {
    'use strict';

	var doc = typeof document !== 'undefined' ? document : null;
	
	if (root == null) {
		root = typeof window === 'undefined' || doc == null ? global : window;
	}
	
	
	factory(root, doc);

}(this, function (global, document) {
    'use strict';
