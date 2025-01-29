(function (root, factory) {
    'use strict';

    var _global, _module;

    _global = typeof window === 'undefined' ? global : window;

    if (root != null && root !== _global && root.exports) {
        _module = root;
    }
    if (_module == null) {
        _module = typeof module === 'undefined' ? { exports: {} } : module;
    }

    factory(_global, _module, _module.exports, _global.document);

    if (typeof include !== 'undefined' && typeof include.js === 'function') {
        include.exports = _module.exports;
        // allow only one `include` per application
        return;
    }
    _global.include = _module.exports.include;
    _global.includeLib = _module.exports.includeLib;

}(this, function (global, module, exports, document) {
    'use strict';

    var CURRENT_MODULE = module;

    /**MODULE**/

}));
