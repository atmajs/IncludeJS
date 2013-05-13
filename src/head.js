(function (root, factory) {
    'use strict';

    if (root == null && typeof global !== 'undefined'){
        root = global;
    }

    var doc = typeof document === 'undefined' ? null : document;

	
	factory(root, doc);


}(this, function (global, document) {
    'use strict';
