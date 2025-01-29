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

    _global.includeLib = _module.exports.includeLib;
    _global.includeModule = _module.exports;

}(this, function (global, module, exports, document) {
    'use strict';

    var CURRENT_MODULE = module;

    /**MODULE**/

}));
