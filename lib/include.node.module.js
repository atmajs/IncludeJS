// source ./umd/umd-module.js
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
	
	var _src_Bin = {};
var _src_Config = {};
var _src_CustomLoader = {};
var _src_Events = {};
var _src_Helper = {};
var _src_Include = {};
var _src_IncludeDeferred = {};
var _src_LazyModule = {};
var _src_PathResolver = {};
var _src_Resource = {};
var _src_Routing = {};
var _src_ScriptStack = {};
var _src_global = {};
var _src_loader_load = {};
var _src_loader_mask = {};
var _src_models_State = {};
var _src_models_Type = {};
var _src_modules_amd = {};
var _src_modules_common = {};
var _src_node_PatchEval = {};
var _src_node_PatchResource = {};
var _src_node_PatchXhr = {};
var _src_node_eval = {};
var _src_node_export = {};
var _src_node_utils_file = {};
var _src_utils_array = {};
var _src_utils_class_Dfr = {};
var _src_utils_fn = {};
var _src_utils_object = {};
var _src_utils_path = {};
var _src_utils_res = {};
var _src_utils_tree = {};
var _src_worker_WorkerClient = {};
var _src_worker_WorkerLoader = {};

// source ./ModuleSimplified.js
var _src_global;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_global != null ? _src_global : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noConflict = exports.include = exports.document = exports.module = exports.global = exports.handler = exports.refs = exports.isWeb = exports.isNode = exports.isBrowser = exports.__require = exports.emptyResponse = exports.IncludeLib = exports.loadBags = void 0;
var _global = typeof global === 'undefined' ? null : global;
exports.global = _global;
var _module = typeof module === 'undefined' ? null : module;
exports.module = _module;
var _document = typeof document === 'undefined' ? null : document;
exports.document = _document;
var _require = typeof require === 'undefined' ? null : require;
var _include = global === null || global === void 0 ? void 0 : global.include;
exports.include = _include;
exports.loadBags = [
    _document
];
exports.IncludeLib = {
    loadBags: exports.loadBags,
};
exports.emptyResponse = {
    load: {}
};
exports.__require = {
    nativeRequire: _require,
    includeRequire: null
};
var _isBrowser = false, _isNode = false;
//#if (NODE)
_isBrowser = false;
_isNode = true;
//#endif
exports.isBrowser = _isBrowser;
exports.isNode = _isNode;
exports.isWeb = !!(typeof location !== 'undefined' && location.protocol && /^https?:/.test(location.protocol));
exports.refs = {
    XMLHttpRequest: global.XMLHttpRequest,
    evaluate: typeof __eval !== 'undefined' ? __eval : null
};
exports.handler = {
    onerror: null
};
var __noConflict = {
    require: _global.require,
    module: _global.module,
    include: _global.include,
    exports: _global.exports
};
function noConflict() {
    for (var key in __noConflict) {
        try {
            _global[key] = __noConflict[key];
        }
        catch (error) { }
    }
}
exports.noConflict = noConflict;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_global === module.exports) {
        // do nothing if
    } else if (__isObj(_src_global) && __isObj(module.exports)) {
        Object.assign(_src_global, module.exports);
    } else {
        _src_global = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_path;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_path != null ? _src_utils_path : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.path_combine = exports.path_isRelative = exports.path_resolveUrl = exports.path_toLocalFile = exports.path_win32Normalize = exports.path_normalize = exports.path_resolveCurrent = exports.path_resolveBase = exports.path_getExtension = exports.path_hasExtension = exports.path_getFile = exports.path_cdUp = exports.path_getDir = void 0;
var Config_1 = _src_Config;
var global_1 = _src_global;
var reg_hasProtocol = /^[\w\-]{2,}:\/\//i;
var reg_hasExt = /\.(?<extension>[\w]{1,})($|\?|#)/;
function path_getDir(path) {
    return path.substring(0, path.lastIndexOf('/') + 1);
}
exports.path_getDir = path_getDir;
function path_cdUp(dirpath) {
    return dirpath.replace(/[^\/]+\/?$/, '');
}
exports.path_cdUp = path_cdUp;
function path_getFile(path) {
    path = path
        .replace('file://', '')
        .replace(/\\/g, '/')
        .replace(/\?[^\n]+$/, '');
    if (/^\/\w+:\/[^\/]/i.test(path)) {
        // win32 drive
        return path.substring(1);
    }
    return path;
}
exports.path_getFile = path_getFile;
function path_hasExtension(path) {
    return reg_hasExt.test(path);
}
exports.path_hasExtension = path_hasExtension;
function path_getExtension(path) {
    var _a;
    var match = reg_hasExt.exec(path);
    return (_a = match === null || match === void 0 ? void 0 : match.groups) === null || _a === void 0 ? void 0 : _a.extension;
}
exports.path_getExtension = path_getExtension;
function path_resolveBase() {
    //#if (NODE)
    if (global_1.isNode) {
        return path_win32Normalize(process.cwd() + '/');
    }
    //#endif
    var doc = global_1.document;
    var origin = global_1.document.location.origin;
    var path = Config_1.cfg.base || '/';
    if (!Config_1.cfg.base && Config_1.cfg.lockedToFolder) {
        path = doc.location.pathname;
        if (/\.[a-z]{1,5}$/i.test(path)) {
            path = path.replace(/[^\\/]+$/i, '');
        }
    }
    return path_combine(origin, path, '/');
}
exports.path_resolveBase = path_resolveBase;
function path_resolveCurrent() {
    if (global_1.document == null) {
        return global_1.global.module == null ? '' : path_win32Normalize(process.cwd() + '/');
    }
    var scripts = global_1.document.getElementsByTagName('script');
    var last = scripts[scripts.length - 1];
    var url = (last && last.getAttribute('src')) || '';
    if (url[0] === '/') {
        return url;
    }
    var location = window.location.pathname.replace(/\/[^\/]+\.\w+$/, '');
    if (location[location.length - 1] !== '/') {
        location += '/';
    }
    return location + url;
}
exports.path_resolveCurrent = path_resolveCurrent;
function path_normalize(path) {
    var path_ = path
        .replace(/\\/g, '/')
        // remove double slashes, but not near protocol
        .replace(/([^:\/])\/{2,}/g, '$1/');
    // use triple slashes by file protocol
    if (/^file:\/\/[^\/]/.test(path_)) {
        path_ = path_.replace('file://', 'file:///');
    }
    return path_;
}
exports.path_normalize = path_normalize;
function path_win32Normalize(path) {
    path = path_normalize(path);
    if (path.substring(0, 5) === 'file:') {
        return path;
    }
    return path_combine('file:///', path);
}
exports.path_win32Normalize = path_win32Normalize;
function path_toLocalFile(path) {
    //#if (NODE)
    if (global_1.isNode) {
        if (path.startsWith('file:')) {
            path = path.replace(/^file:\/+/, '');
            if (/^\w{1,3}:/.test(path) === false) {
                path = '/' + path;
            }
            return path;
        }
        return path_combine(process.cwd(), path);
    }
    //#endif
    return path;
}
exports.path_toLocalFile = path_toLocalFile;
function path_resolveUrl(url, parent) {
    url = path_normalize(url);
    if (reg_hasProtocol.test(url)) {
        return Path.collapse(url);
    }
    if (url.substring(0, 2) === './') {
        url = url.substring(2);
    }
    if (url[0] === '/' && parent != null && parent.base != null) {
        url = path_combine(parent.base, url);
        if (reg_hasProtocol.test(url)) {
            return Path.collapse(url);
        }
    }
    if (url[0] === '/' && Config_1.cfg.path && url.indexOf(Config_1.cfg.path) !== 0) {
        url = path_combine(Config_1.cfg.path, url);
        if (reg_hasProtocol.test(url)) {
            return Path.collapse(url);
        }
    }
    if (url[0] !== '/') {
        if (parent != null && parent.location != null) {
            url = path_combine(parent.location, url);
        }
        else {
            var current = path_resolveCurrent();
            var dir = path_getDir(current);
            url = path_combine(dir, url);
        }
    }
    if (url[0] !== '/' && reg_hasProtocol.test(url) === false) {
        url = '/' + url;
    }
    return Path.collapse(url);
}
exports.path_resolveUrl = path_resolveUrl;
function path_isRelative(path) {
    var c = path.charCodeAt(0);
    switch (c) {
        case 46: /* . */
            return true;
        case 47:
            // /
            return false;
    }
    return reg_hasProtocol.test(path) === false;
}
exports.path_isRelative = path_isRelative;
function path_combine() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var out = '';
    var imax = args.length;
    var i = -1;
    while (++i < imax) {
        var x = args[i];
        if (!x) {
            continue;
        }
        x = path_normalize(x);
        if (out === '') {
            out = x;
            continue;
        }
        if (out[out.length - 1] !== '/') {
            out += '/';
        }
        if (x[0] === '/') {
            x = x.substring(1);
        }
        out += x;
    }
    return out;
}
exports.path_combine = path_combine;
var Path;
(function (Path) {
    var rgx_host = /^\w+:\/\/[^\/]+\//;
    var rgx_subFolder = /\/?([^\/]+\/)\.\.\//;
    var rgx_dottedFolder = /\/\.\.\//;
    function collapse(url) {
        var host = rgx_host.exec(url);
        if (host) {
            url = url.replace(host[0], '');
        }
        var path = url;
        do {
            url = path;
            path = path.replace(rgx_subFolder, '/');
        } while (path !== url);
        path = path.replace(/\/\.\//g, '/');
        if (host) {
            return host[0] + path;
        }
        return path;
    }
    Path.collapse = collapse;
})(Path || (Path = {}));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_path === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_path) && __isObj(module.exports)) {
        Object.assign(_src_utils_path, module.exports);
    } else {
        _src_utils_path = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_models_Type;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_models_Type != null ? _src_models_Type : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = void 0;
var ResourceType;
(function (ResourceType) {
    ResourceType["Js"] = "js";
    ResourceType["Css"] = "css";
    ResourceType["Load"] = "load";
    ResourceType["Ajax"] = "ajax";
    ResourceType["Embed"] = "embed";
    ResourceType["Lazy"] = "lazy";
    ResourceType["Mask"] = "mask";
})(ResourceType = exports.ResourceType || (exports.ResourceType = {}));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_models_Type === module.exports) {
        // do nothing if
    } else if (__isObj(_src_models_Type) && __isObj(module.exports)) {
        Object.assign(_src_models_Type, module.exports);
    } else {
        _src_models_Type = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_array;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_array != null ? _src_utils_array : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arr_indexOf = exports.arr_ensure = exports.arr_invoke = void 0;
function arr_invoke(arr, args, ctx) {
    if (arr == null || arr instanceof Array === false) {
        return;
    }
    for (var i = 0, length = arr.length; i < length; i++) {
        if (typeof arr[i] !== 'function') {
            continue;
        }
        if (args == null) {
            arr[i].call(ctx);
        }
        else {
            arr[i].apply(ctx, args);
        }
    }
}
exports.arr_invoke = arr_invoke;
function arr_ensure(obj, xpath) {
    if (!xpath) {
        return obj;
    }
    var arr = xpath.split('.'), imax = arr.length - 1, i = 0, key;
    for (; i < imax; i++) {
        key = arr[i];
        obj = obj[key] || (obj[key] = {});
    }
    key = arr[imax];
    return obj[key] || (obj[key] = []);
}
exports.arr_ensure = arr_ensure;
function arr_indexOf(arr, fn) {
    if (arr == null)
        return -1;
    var imax = arr.length, i = -1;
    while (++i < imax) {
        if (fn(arr[i], i))
            return i;
    }
    return -1;
}
exports.arr_indexOf = arr_indexOf;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_array === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_array) && __isObj(module.exports)) {
        Object.assign(_src_utils_array, module.exports);
    } else {
        _src_utils_array = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_fn;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_fn != null ? _src_utils_fn : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fn_doNothing = exports.fn_proxy = void 0;
function fn_proxy(fn, ctx) {
    return function () {
        fn.apply(ctx, arguments);
    };
}
exports.fn_proxy = fn_proxy;
function fn_doNothing(fn) {
    typeof fn === 'function' && fn();
}
exports.fn_doNothing = fn_doNothing;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_fn === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_fn) && __isObj(module.exports)) {
        Object.assign(_src_utils_fn, module.exports);
    } else {
        _src_utils_fn = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Events;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Events != null ? _src_Events : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Events = void 0;
var array_1 = _src_utils_array;
var fn_1 = _src_utils_fn;
var readycollection = [];
var supports = typeof document !== 'undefined' && typeof window !== 'undefined';
function onReady() {
    exports.Events.ready = fn_1.fn_doNothing;
    if (readycollection.length === 0) {
        return;
    }
    (0, array_1.arr_invoke)(readycollection);
    readycollection.length = 0;
}
function bind() {
    if ('onreadystatechange' in document) {
        document.onreadystatechange = function () {
            if (/complete|interactive/g.test(document.readyState) === false) {
                return;
            }
            onReady();
        };
    }
    else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', onReady);
    }
    else {
        window.onload = onReady;
    }
}
if (supports) {
    bind();
}
exports.Events = {
    ready: function (callback) {
        if (supports === false) {
            callback();
            return;
        }
        readycollection.unshift(callback);
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Events === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Events) && __isObj(module.exports)) {
        Object.assign(_src_Events, module.exports);
    } else {
        _src_Events = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Routing;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Routing != null ? _src_Routing : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesLib = exports.Routes = exports.RoutesCtor = void 0;
var path_1 = _src_utils_path;
var RoutesCtor = /** @class */ (function () {
    function RoutesCtor() {
        this.routes = {};
    }
    /**
     *    @param route {String} = Example: '.reference/libjs/{0}/{1}.js'
     */
    RoutesCtor.prototype.register = function (namespace, route) {
        if (namespace.endsWith('/*')) {
            // like TS paths, '@foo/*': [ 'foo/ts/*' ]
            var ns = namespace.replace('/*', '');
            var path = typeof route === 'string' ? route : route[0];
            this.register(ns, path.replace('*', '{0}'));
            return;
        }
        if (typeof route === 'string') {
            if ((0, path_1.path_isRelative)(route)) {
                var location = (0, path_1.path_getDir)((0, path_1.path_resolveCurrent)());
                if ((0, path_1.path_isRelative)(location)) {
                    location = '/' + location;
                }
                route = location + route;
            }
            if (route[0] === '/') {
                var base = (0, path_1.path_resolveBase)();
                route = (0, path_1.path_combine)(base, route);
            }
        }
        this.routes[namespace] = route instanceof Array
            ? route
            : route.split(/[\{\}]/g);
    };
    /**
     *    @param {String} template = Example: 'scroller/scroller.min?ui=black'
     */
    RoutesCtor.prototype.resolve = function (namespace, template) {
        var questionMark = template.indexOf('?'), aliasIndex = template.indexOf('::'), alias, query = '';
        if (aliasIndex !== -1) {
            alias = template.substring(aliasIndex + 2);
            template = template.substring(0, aliasIndex);
        }
        if (questionMark !== -1) {
            query = template.substring(questionMark);
            template = template.substring(0, questionMark);
        }
        var slugs = template.split('/');
        var route = this.routes[namespace];
        if (route == null) {
            return {
                path: slugs.join('/') + query,
                params: null,
                alias: alias
            };
        }
        var path = route[0];
        for (var i = 1; i < route.length; i++) {
            if (i % 2 === 0) {
                path += route[i];
            }
            else {
                /** if template provides less "breadcrumbs" than needed -
                 * take always the last one for failed peaces */
                var index = parseFloat(route[i]);
                if (index > slugs.length - 1) {
                    index = slugs.length - 1;
                }
                path += slugs[index];
                if (i === route.length - 2) {
                    for (index++; index < slugs.length; index++) {
                        path += '/' + slugs[index];
                    }
                }
            }
        }
        return {
            path: path + query,
            params: null,
            alias: alias
        };
    };
    /**
     *    @arg includeData :
     *    1. string - URL to resource
     *    2. array - URLs to resources
     *    3. object - {route: x} - route defines the route template to resource,
     *        it must be set before in include.cfg.
     *        example:
     *            include.cfg('net','scripts/net/{name}.js')
     *            include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
     *    @arg namespace - route in case of resource url template, or namespace in case of LazyModule
     *
     *    @arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
     *    @arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
     */
    RoutesCtor.prototype.each = function (type, includeData, fn, namespace, xpath) {
        if (includeData == null) {
            return;
        }
        if (type === 'lazy' && xpath == null) {
            var obj = includeData;
            for (var key_1 in obj) {
                this.each(type, obj[key_1], fn, null, key_1);
            }
            return;
        }
        if (includeData instanceof Array) {
            for (var i = 0; i < includeData.length; i++) {
                this.each(type, includeData[i], fn, namespace, xpath);
            }
            return;
        }
        if (typeof includeData === 'object') {
            for (var key in includeData) {
                this.each(type, includeData[key], fn, key, xpath);
            }
            return;
        }
        if (typeof includeData === 'string') {
            var x = this.resolve(namespace, includeData);
            if (namespace) {
                namespace += '.' + includeData;
            }
            fn(namespace, x, xpath);
            return;
        }
        console.error('Include Package is invalid', arguments);
    };
    RoutesCtor.prototype.getRoutes = function () {
        return this.routes;
    };
    RoutesCtor.prototype.parseAlias = function (route) {
        var path = route.path, result = regexpAlias.exec(path);
        return result && result[1];
    };
    return RoutesCtor;
}());
exports.RoutesCtor = RoutesCtor;
exports.Routes = new RoutesCtor();
function RoutesLib() {
    return new RoutesCtor();
}
exports.RoutesLib = RoutesLib;
;
var regexpAlias = /([^\\\/]+)\.\w+$/;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Routing === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Routing) && __isObj(module.exports)) {
        Object.assign(_src_Routing, module.exports);
    } else {
        _src_Routing = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_object;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_object != null ? _src_utils_object : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obj_setProperty = exports.obj_getProperty = exports.obj_inherit = void 0;
function obj_inherit(target /* source, ..*/) {
    if (typeof target === 'function') {
        target = target.prototype;
    }
    var i = 1, imax = arguments.length, source, key;
    for (; i < imax; i++) {
        source = typeof arguments[i] === 'function'
            ? arguments[i].prototype
            : arguments[i];
        for (key in source) {
            target[key] = source[key];
        }
    }
    return target;
}
exports.obj_inherit = obj_inherit;
;
function obj_getProperty(obj, property) {
    var chain = property.split('.'), length = chain.length, i = 0;
    for (; i < length; i++) {
        if (obj == null)
            return null;
        obj = obj[chain[i]];
    }
    return obj;
}
exports.obj_getProperty = obj_getProperty;
;
function obj_setProperty(obj, property, value) {
    var chain = property.split('.'), imax = chain.length - 1, i = -1, key;
    while (++i < imax) {
        key = chain[i];
        if (obj[key] == null)
            obj[key] = {};
        obj = obj[key];
    }
    obj[chain[i]] = value;
}
exports.obj_setProperty = obj_setProperty;
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_object === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_object) && __isObj(module.exports)) {
        Object.assign(_src_utils_object, module.exports);
    } else {
        _src_utils_object = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_tree;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_tree != null ? _src_utils_tree : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tree_resolveUsage = void 0;
var object_1 = _src_utils_object;
var Routing_1 = _src_Routing;
function tree_resolveUsage(resource, usage, next) {
    var use = [], imax = usage.length, i = -1, obj, path, name, index, parent;
    while (++i < imax) {
        name = path = usage[i];
        index = path.indexOf('.');
        if (index !== -1) {
            name = path.substring(0, index);
            path = path.substring(index + 1);
        }
        parent = use_resolveParent(name, resource.parent, resource);
        if (parent == null)
            return null;
        if (parent.state !== 4) {
            resource.state = 3;
            parent.on(4, next, parent, 'push');
            return null;
        }
        obj = parent.exports;
        if (name !== path)
            obj = (0, object_1.obj_getProperty)(obj, path);
        // if DEBUG
        (typeof obj === 'object' && obj == null)
            && console.warn('<include:use> Used resource has no exports', name, resource.url);
        // endif
        use[i] = obj;
    }
    return use;
}
exports.tree_resolveUsage = tree_resolveUsage;
;
function use_resolveParent(name, resource, initiator) {
    if (resource == null) {
        // if DEBUG
        console.warn('<include> Usage Not Found:', name);
        console.warn('- Ensure to have it included before with the correct alias');
        console.warn('- Initiator Stacktrace:');
        var arr = [], res = initiator;
        while (res != null) {
            arr.push(res.url);
            res = res.parent;
        }
        console.warn(arr.join('\n'));
        // endif
        return null;
    }
    var includes = resource.includes, i = -1, imax = includes.length, include, exports, alias;
    while (++i < imax) {
        include = includes[i];
        alias = include.route.alias || Routing_1.Routes.parseAlias(include.route);
        if (alias === name)
            return include.resource;
    }
    return use_resolveParent(name, resource.parent, initiator);
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_tree === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_tree) && __isObj(module.exports)) {
        Object.assign(_src_utils_tree, module.exports);
    } else {
        _src_utils_tree = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_models_State;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_models_State != null ? _src_models_State : {};
    var module = { exports: exports };

    "use strict";
/**
 * STATES:
 * 0: Resource Created
 * 1: Loading
 * 2: Loaded - Evaluating
 * 2.5: Paused - Evaluating paused
 * 3: Evaluated - Childs Loading
 * 4: Childs Loaded - Completed
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
var State;
(function (State) {
    State[State["Unknown"] = -1] = "Unknown";
    State[State["Created"] = 0] = "Created";
    State[State["Loading"] = 1] = "Loading";
    State[State["Evaluating"] = 2] = "Evaluating";
    State[State["Paused"] = 2.5] = "Paused";
    State[State["Evaluated"] = 3] = "Evaluated";
    State[State["AllCompleted"] = 4] = "AllCompleted";
})(State = exports.State || (exports.State = {}));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_models_State === module.exports) {
        // do nothing if
    } else if (__isObj(_src_models_State) && __isObj(module.exports)) {
        Object.assign(_src_models_State, module.exports);
    } else {
        _src_models_State = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_class_Dfr;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_class_Dfr != null ? _src_utils_class_Dfr : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeferred = exports.class_Dfr = void 0;
var class_Dfr = /** @class */ (function () {
    function class_Dfr() {
        this._isAsync = true;
        this._done = null;
        this._fail = null;
        this._always = null;
        this._resolved = null;
        this._rejected = null;
    }
    class_Dfr.prototype.defer = function () {
        this._rejected = null;
        this._resolved = null;
        return this;
    };
    class_Dfr.prototype.isResolved = function () {
        return this._resolved != null;
    };
    class_Dfr.prototype.isRejected = function () {
        return this._rejected != null;
    };
    class_Dfr.prototype.isBusy = function () {
        return this._resolved == null && this._rejected == null;
    };
    class_Dfr.prototype.resolve = function (value) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var done = this._done, always = this._always;
        this._resolved = arguments;
        dfr_clearListeners(this);
        arr_callOnce(done, this, arguments);
        arr_callOnce(always, this, [this]);
        return this;
    };
    class_Dfr.prototype.reject = function (error) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var fail = this._fail, always = this._always;
        this._rejected = arguments;
        dfr_clearListeners(this);
        arr_callOnce(fail, this, arguments);
        arr_callOnce(always, this, [this]);
        return this;
    };
    class_Dfr.prototype.then = function (filterSuccess, filterError) {
        var dfr = new class_Dfr();
        var done_ = filterSuccess, fail_ = filterError;
        this
            .done(delegate(dfr, 'resolve', done_))
            .fail(delegate(dfr, 'reject', fail_));
        return dfr;
    };
    class_Dfr.prototype.done = function (callback) {
        if (this._rejected != null) {
            return this;
        }
        return dfr_bind(this, this._resolved, this._done || (this._done = []), callback);
    };
    class_Dfr.prototype.fail = function (callback) {
        if (this._resolved != null) {
            return this;
        }
        return dfr_bind(this, this._rejected, this._fail || (this._fail = []), callback);
    };
    class_Dfr.prototype.always = function (callback) {
        return dfr_bind(this, this._rejected || this._resolved, this._always || (this._always = []), callback);
    };
    class_Dfr.prototype.pipe = function (mix /* ..methods */) {
        var dfr;
        if (typeof mix === 'function') {
            dfr = new class_Dfr();
            var done_ = mix, fail_ = arguments.length > 1
                ? arguments[1]
                : null;
            this
                .done(delegate(dfr, 'resolve', done_))
                .fail(delegate(dfr, 'reject', fail_));
            return dfr;
        }
        dfr = mix;
        var imax = arguments.length, done = imax === 1, fail = imax === 1, i = 0, x;
        while (++i < imax) {
            x = arguments[i];
            switch (x) {
                case 'done':
                    done = true;
                    break;
                case 'fail':
                    fail = true;
                    break;
                default:
                    console.error('Unsupported pipe channel', arguments[i]);
                    break;
            }
        }
        done && this.done(delegate(dfr, 'resolve'));
        fail && this.fail(delegate(dfr, 'reject'));
        function pipe(dfr, method) {
            return function () {
                dfr[method].apply(dfr, arguments);
            };
        }
        return this;
    };
    class_Dfr.prototype.pipeCallback = function () {
        var self = this;
        return function (error) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (error != null) {
                self.reject(error);
                return;
            }
            self.resolve.apply(self, args);
        };
    };
    class_Dfr.prototype.catch = function (cb) {
        return this.fail(cb);
    };
    class_Dfr.prototype.finally = function (cb) {
        return this.always(cb);
    };
    class_Dfr.resolve = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var dfr = new class_Dfr();
        return dfr.resolve.apply(dfr, args);
    };
    class_Dfr.reject = function (error) {
        var dfr = new class_Dfr();
        return dfr.reject(error);
    };
    return class_Dfr;
}());
exports.class_Dfr = class_Dfr;
;
// PRIVATE
function delegate(dfr, name, fn) {
    return function () {
        if (fn != null) {
            var override = fn.apply(this, arguments);
            if (override != null && override !== dfr) {
                if (isDeferred(override)) {
                    override.then(delegate(dfr, 'resolve'), delegate(dfr, 'reject'));
                    return;
                }
                dfr[name](override);
                return;
            }
        }
        dfr[name].apply(dfr, arguments);
    };
}
function dfr_bind(dfr, arguments_, listeners, callback) {
    if (callback == null)
        return dfr;
    if (arguments_ != null)
        callback.apply(dfr, arguments_);
    else
        listeners.push(callback);
    return dfr;
}
function dfr_clearListeners(dfr) {
    dfr._done = null;
    dfr._fail = null;
    dfr._always = null;
}
function arr_callOnce(arr, ctx, args) {
    if (arr == null)
        return;
    var imax = arr.length, i = -1, fn;
    while (++i < imax) {
        fn = arr[i];
        if (fn) {
            fn.apply(ctx, args);
        }
    }
    arr.length = 0;
}
function isDeferred(x) {
    return x != null
        && typeof x === 'object'
        && typeof x.then === 'function';
}
exports.isDeferred = isDeferred;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_class_Dfr === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_class_Dfr) && __isObj(module.exports)) {
        Object.assign(_src_utils_class_Dfr, module.exports);
    } else {
        _src_utils_class_Dfr = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_IncludeDeferred;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_IncludeDeferred != null ? _src_IncludeDeferred : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncludeDeferred = void 0;
var Events_1 = _src_Events;
var Routing_1 = _src_Routing;
var Config_1 = _src_Config;
var global_1 = _src_global;
var tree_1 = _src_utils_tree;
var State_1 = _src_models_State;
var Type_1 = _src_models_Type;
var class_Dfr_1 = _src_utils_class_Dfr;
var IncludeDeferred = /** @class */ (function () {
    function IncludeDeferred() {
        this.callbacks = [];
        this.state = State_1.State.Unknown;
        this.response = null;
        this.includes = [];
        // Array: exports
        this._use = null;
        // Array: names
        this._usage = null;
    }
    IncludeDeferred.prototype.on = function (state, callback, sender, mutator) {
        if (sender === void 0) { sender = null; }
        if (this === sender && this.state === State_1.State.Unknown) {
            callback(this);
            return this;
        }
        // this === sender in case when script loads additional
        // resources and there are already parents listeners
        if (mutator == null) {
            mutator = (this.state < State_1.State.Evaluated || this === sender)
                ? 'unshift'
                : 'push';
        }
        state <= this.state ? callback(this) : this.callbacks[mutator]({
            state: state,
            callback: callback
        });
        return this;
    };
    IncludeDeferred.prototype.hasPendingChildren = function () {
        return false;
    };
    IncludeDeferred.prototype.readystatechanged = function (state) {
        if (this.state < state) {
            this.state = state;
        }
        if (this.state === State_1.State.Evaluated) {
            if (this.hasPendingChildren()) {
                return;
            }
            this.state = State_1.State.AllCompleted;
        }
        var currentState = this.state, cbs = this.callbacks, imax = cbs.length, i = -1;
        if (imax === 0) {
            return;
        }
        while (++i < imax) {
            var x = cbs[i];
            if (x == null || x.state > this.state) {
                continue;
            }
            cbs.splice(i, 1);
            imax--;
            i--;
            x.callback(this);
            if (this.state < currentState) {
                break;
            }
        }
    };
    /** assets loaded and DomContentLoaded */
    IncludeDeferred.prototype.ready = function (callback) {
        var _this = this;
        return this.on(State_1.State.AllCompleted, function () {
            Events_1.Events.ready(function () { return _this.resolve(callback); });
        }, this);
    };
    /** assets loaded */
    IncludeDeferred.prototype.done = function (callback) {
        var _this = this;
        return this.on(State_1.State.AllCompleted, function () { return _this.resolve(callback); }, this);
    };
    IncludeDeferred.prototype.then = function (onComplete, onError) {
        this.done(onComplete);
    };
    IncludeDeferred.prototype.resolve = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var includes, length, i, x, resource, route, type, _a, alias, responseObj, exp, response, before;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        includes = this.includes;
                        length = includes == null
                            ? 0
                            : includes.length;
                        if (!(length > 0)) return [3 /*break*/, 7];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < length)) return [3 /*break*/, 7];
                        x = includes[i];
                        resource = x.resource;
                        route = x.route;
                        type = resource.type;
                        _a = type;
                        switch (_a) {
                            case 'js': return [3 /*break*/, 2];
                            case 'load': return [3 /*break*/, 2];
                            case 'ajax': return [3 /*break*/, 2];
                            case 'mask': return [3 /*break*/, 2];
                            case 'embed': return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 6];
                    case 2:
                        alias = route.alias || Routing_1.Routes.parseAlias(route);
                        responseObj = type === 'js'
                            ? (this.response)
                            : (this.response[type] || (this.response[type] = {}));
                        if (!(alias != null)) return [3 /*break*/, 5];
                        exp = resource.exports;
                        if (Config_1.cfg.es6Exports && (exp != null && typeof exp === 'object')) {
                            exp = exp.default || exp;
                        }
                        if (!(0, class_Dfr_1.isDeferred)(exp)) return [3 /*break*/, 4];
                        return [4 /*yield*/, exp];
                    case 3:
                        exp = _b.sent();
                        _b.label = 4;
                    case 4:
                        responseObj[alias] = exp;
                        return [3 /*break*/, 6];
                    case 5:
                        console.warn('<includejs> Alias is undefined', resource);
                        return [3 /*break*/, 6];
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        response = this.response || global_1.emptyResponse;
                        if (this._use == null && this._usage != null) {
                            this._use = (0, tree_1.tree_resolveUsage)(this, this._usage, function () {
                                _this.state = State_1.State.AllCompleted;
                                _this.resolve(callback);
                                _this.readystatechanged(State_1.State.AllCompleted);
                            });
                            if (this.state < State_1.State.AllCompleted)
                                return [2 /*return*/];
                        }
                        if (this._use) {
                            callback.apply(null, [response].concat(this._use));
                            return [2 /*return*/];
                        }
                        before = null;
                        if (this.type === Type_1.ResourceType.Js) {
                            before = global.include;
                            global.include = this;
                        }
                        callback(response);
                        if (before != null && global.include === this) {
                            global.include = before;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return IncludeDeferred;
}());
exports.IncludeDeferred = IncludeDeferred;
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_IncludeDeferred === module.exports) {
        // do nothing if
    } else if (__isObj(_src_IncludeDeferred) && __isObj(module.exports)) {
        Object.assign(_src_IncludeDeferred, module.exports);
    } else {
        _src_IncludeDeferred = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Bin;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Bin != null ? _src_Bin : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bin_tryReload = exports.bin_remove = exports.bin_removeDelegate = exports.bin = exports.Bin = void 0;
var path_1 = _src_utils_path;
var Config_1 = _src_Config;
exports.Bin = {
    add: function (type, id, resource) {
        exports.bin[type][normalize(id)] = resource;
    },
    find: function (url) {
        var x = find(exports.bin, url);
        return x && x.resource || null;
    },
    remove: function (url) {
        while (true) {
            // clear if has multiple types
            var x = find(exports.bin, url);
            if (x == null)
                break;
            exports.bin[x.type][x.id] = null;
        }
    },
    get: function (type, url) {
        var x = findInType(exports.bin, type, url);
        if (x == null) {
            x = find(exports.bin, url);
        }
        return x && x.resource || null;
    }
};
exports.bin = {
    js: {},
    css: {},
    load: {},
    ajax: {},
    embed: {},
    mask: {}
};
function bin_removeDelegate(url) {
    // use timeout as sys-file-change event is called twice
    var timeout;
    return function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            bin_tryReload(url, function () {
                Config_1.cfg.autoreload && Config_1.cfg.autoreload.fileChanged(url, 'include');
            });
        }, 150);
    };
}
exports.bin_removeDelegate = bin_removeDelegate;
;
function bin_remove(url) {
    var x = find(exports.bin, url);
    if (x == null) {
        console.warn('<include:res:remove> Resource is not in cache', url);
        return null;
    }
    var type = x.type, id = x.id, resource = x.resource;
    if (resource == null) {
        return null;
    }
    if (global.io && global.io.File) {
        global.io.File.clearCache(resource.url);
    }
    exports.bin[type][id] = null;
    var roots = clearParents(exports.bin, resource);
    return {
        resource: resource,
        parents: roots
    };
}
exports.bin_remove = bin_remove;
;
function bin_tryReload(path, callback) {
    var result = bin_remove(path);
    if (result == null) {
        callback(false);
        return;
    }
    var resource = result.resource, parents = result.parents;
    if (parents == null || parents.length === 0) {
        callback(true);
        return;
    }
    var count = parents.length, imax = count, i = -1;
    while (++i < imax) {
        bin_load(resource, parents[i]).done(function () {
            if (--count === 0) {
                callback(true);
            }
        });
    }
}
exports.bin_tryReload = bin_tryReload;
// PRIVATE
function bin_load(resource, parent) {
    parent.exports = null;
    return parent
        .create(resource.type, resource.route, resource.namespace, resource.xpath)
        .resource
        .on(4, parent.childLoaded);
}
function normalize(url) {
    var id = (0, path_1.path_normalize)(url);
    var q = id.indexOf('?');
    if (q !== -1)
        id = id.substring(0, q);
    return id.toLowerCase();
}
function find(bins, url) {
    if (url == null) {
        return null;
    }
    url = normalize(url);
    for (var type in bins) {
        var x = findInType(bins, type, url);
        if (x != null) {
            return x;
        }
    }
    return null;
}
function findInType(bins, type, url) {
    if (url == null || type == null) {
        return null;
    }
    var bin = bins[type];
    if (url in bin) {
        return {
            type: type,
            id: url,
            resource: bin[url]
        };
    }
    url = normalize(url);
    for (var id in bin) {
        if (endsWith(id, url) || endsWith(url, id)) {
            var resource = bin[id];
            if (resource == null) {
                continue;
            }
            return {
                type: type,
                id: id,
                resource: resource
            };
        }
    }
}
function endsWith(str, end) {
    var sL = str.length;
    var eL = end.length;
    return sL >= eL && str.indexOf(end) === str.length - end.length;
}
function findParents(bins, resource) {
    var arr = [];
    for (var type in bins) {
        var bin_1 = bins[type];
        for (var id in bin_1) {
            var res = bin_1[id];
            if (res == null) {
                continue;
            }
            var children = res.includes;
            if (children == null) {
                continue;
            }
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.resource.url === resource.url) {
                    arr.push({ resource: res, id: id, type: type });
                    break;
                }
            }
        }
    }
    return arr;
}
function clearParents(bins, resource, roots, handled) {
    if (roots === void 0) { roots = []; }
    if (handled === void 0) { handled = []; }
    if (handled.indexOf(resource.url) > -1) {
        return roots;
    }
    var parents = findParents(bins, resource);
    if (parents.length === 0) {
        roots.push(resource);
        return roots;
    }
    parents.forEach(function (x) {
        bins[x.type][x.id] = null;
        clearParents(bins, x.resource, roots, handled);
        handled.push(x.resource.url);
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Bin === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Bin) && __isObj(module.exports)) {
        Object.assign(_src_Bin, module.exports);
    } else {
        _src_Bin = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Helper;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Helper != null ? _src_Helper : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
var Config_1 = _src_Config;
var global_1 = _src_global;
var class_Dfr_1 = _src_utils_class_Dfr;
exports.Helper = {
    reportError: function (e) {
        console.error('IncludeJS Error:', e, e.message, e.url);
        global_1.handler.onerror && global_1.handler.onerror(e);
    },
    XHR: function (resource, callback) {
        var xhr = new global_1.refs.XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback === null || callback === void 0 ? void 0 : callback(resource, xhr.responseText);
            }
        };
        var url = typeof resource === 'object' ? resource.url : resource;
        var async = Config_1.cfg.sync === true ? false : true;
        if (global_1.isBrowser && Config_1.cfg.version) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Config_1.cfg.version;
        }
        if (url[0] === '/' && Config_1.cfg.lockedToFolder === true) {
            url = url.substring(1);
        }
        xhr.addEventListener('error', function (err) {
            if (typeof resource !== 'string') {
                resource.error = err;
            }
        });
        xhr.open('GET', url, async);
        xhr.send();
    },
    XHR_LOAD: function (url, callback) {
        var xhr = new global_1.refs.XMLHttpRequest();
        var dfr = callback == null
            ? new class_Dfr_1.class_Dfr()
            : null;
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            var body = xhr.responseText;
            var headers = xhr.getAllResponseHeaders();
            var status = xhr.status;
            if (status !== 200) {
                dfr === null || dfr === void 0 ? void 0 : dfr.resolve({
                    body: body,
                    status: status,
                    headers: headers,
                });
                callback === null || callback === void 0 ? void 0 : callback(status);
                return;
            }
            dfr === null || dfr === void 0 ? void 0 : dfr.resolve({
                body: body,
                status: status,
                headers: headers,
            });
            callback === null || callback === void 0 ? void 0 : callback(null, body);
        };
        xhr.open('GET', url, Config_1.cfg.sync === true ? false : true);
        xhr.send();
        return dfr;
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Helper === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Helper) && __isObj(module.exports)) {
        Object.assign(_src_Helper, module.exports);
    } else {
        _src_Helper = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_PathResolver;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_PathResolver != null ? _src_PathResolver : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeModulePaths = exports.PathResolver = void 0;
var path_1 = _src_utils_path;
var Helper_1 = _src_Helper;
var Type_1 = _src_models_Type;
var Routing_1 = _src_Routing;
var global_1 = _src_global;
exports.PathResolver = {
    configMap: function (map) {
        for (var key in map) {
            _map[key] = map[key];
        }
    },
    configRewrites: function (rewrites) {
        for (var key in rewrites) {
            _rewrites[key] = rewrites[key];
        }
    },
    configNpm: function (modules) {
        modules.forEach(function (name) { return _npm[name] = 1; });
    },
    configExt: function (config) {
        var def = config.def;
        var types = config.types;
        for (var key in def) {
            _ext[key] = def[key];
        }
        for (var key in types) {
            _extTypes[key] = types[key];
        }
    },
    resolveBasic: function (path_, type, parent) {
        var path = map(path_);
        if (type === 'js' && isNodeModuleResolution(path)) {
            return path;
        }
        if (path[0] === '@') {
            var i = path.indexOf('/');
            var namespace = path.substring(0, i);
            var template = path.substring(i + 1);
            var info = Routing_1.Routes.resolve(namespace, template);
            path = info.path;
        }
        path = (0, path_1.path_resolveUrl)(path, parent);
        var rewritten = rewrite(path);
        if (rewritten != null) {
            path = exports.PathResolver.resolveBasic(rewritten, type, parent);
        }
        return ensureExtension(path, type);
    },
    isNpm: isNodeModuleResolution,
    getType: getTypeForPath,
    resolveNpm: function (path_, type, parent, cb) {
        var path = map(path_);
        if ((0, path_1.path_hasExtension)(path)) {
            cb(null, path);
            return;
        }
        if (type === 'js') {
            if (isNodeModuleResolution(path)) {
                var parentsPath = parent && parent.location;
                if (!parentsPath || parentsPath === '/') {
                    parentsPath = (0, path_1.path_resolveCurrent)();
                }
                nodeModuleResolve(parentsPath, path, cb);
                return;
            }
        }
        if ((0, path_1.path_hasExtension)(path) === false) {
            path += '.' + _ext[type];
        }
        cb(null, path);
    },
    isNodeNative: function (path) {
        return _nodeBuiltIns.indexOf(path) !== -1;
    }
};
var _map = Object.create(null);
var _npm = Object.create(null);
var _rewrites = Object.create(null);
var _ext = {
    'js': 'js',
    'css': 'css',
    'mask': 'mask'
};
var _extTypes = {
    'js': Type_1.ResourceType.Js,
    'es6': Type_1.ResourceType.Js,
    'ts': Type_1.ResourceType.Js,
    'css': Type_1.ResourceType.Css,
    'less': Type_1.ResourceType.Css,
    'scss': Type_1.ResourceType.Css,
    'mask': Type_1.ResourceType.Mask,
    'json': Type_1.ResourceType.Load,
    'yml': Type_1.ResourceType.Load
};
var _nodeBuiltIns = [
    "assert",
    "async_hooks",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "http2",
    "https",
    "inspector",
    "module",
    "net",
    "os",
    "path",
    "perf_hooks",
    "process",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "zlib"
];
function map(path) {
    var _a;
    return (_a = _map[path]) !== null && _a !== void 0 ? _a : path;
}
function rewrite(path) {
    for (var key in _rewrites) {
        if (path.endsWith(key)) {
            return _rewrites[key];
        }
    }
    return null;
}
function isNodeModuleResolution(path) {
    var aliasIdx = path.indexOf('::');
    if (aliasIdx > -1) {
        path = path.substring(0, aliasIdx);
    }
    if (path in _npm) {
        return true;
    }
    // npm name
    var rgx_ROOT = /^@?[\w\-_]+$/;
    // npm name with path or npm organization with name and/or path
    var rgx_withPath = /^(@?[\w_]+[\w\-_\.]*)(\/[\w\-_]+)+$/;
    var isNpm = rgx_ROOT.test(path) || rgx_withPath.test(path);
    if (isNpm === false) {
        return false;
    }
    // if namespace is present, most likely is not the npm package.
    var namespace = path.substring(0, path.indexOf('/'));
    return Routing_1.Routes.routes[namespace] == null;
}
var dir;
(function (dir) {
    function getRoot(dirpath) {
        var end = dirpath.indexOf('/');
        if (end === -1) {
            end = dirpath.length;
        }
        return dirpath.substring(0, end);
    }
    dir.getRoot = getRoot;
    function getName(dirpath) {
        var lastIndexOf = null;
        if (dirpath.endsWith('/')) {
            lastIndexOf = dirpath.length - 2;
        }
        var start = dirpath.lastIndexOf(dirpath, lastIndexOf);
        return dirpath.substring(start + 1, lastIndexOf);
    }
    dir.getName = getName;
    function trimStart(path) {
        return path.replace(/^\/+/, '');
    }
    dir.trimStart = trimStart;
    function trimEnd(path) {
        return path.replace(/\/+$/, '');
    }
    dir.trimEnd = trimEnd;
})(dir || (dir = {}));
var NodeModulePaths;
(function (NodeModulePaths) {
    function getPaths(currentPath, packageName) {
        var paths = [];
        var pckg = "/node_modules/".concat(packageName, "/package.json");
        if (global_1.isBrowser) {
            paths.push(pckg);
        }
        var dir = (0, path_1.path_getDir)(currentPath);
        while (true) {
            var path = (0, path_1.path_combine)(dir, pckg);
            paths.push(path);
            var next = (0, path_1.path_cdUp)(dir);
            if (next === dir) {
                break;
            }
            dir = next;
        }
        return paths;
    }
    NodeModulePaths.getPaths = getPaths;
})(NodeModulePaths = exports.NodeModulePaths || (exports.NodeModulePaths = {}));
function nodeModuleResolve(current_, path, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var name, resource, subname, paths, loaderType, i, path_2, resp, json, text, main;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = dir.getRoot(path);
                    resource = dir.trimStart(path.substring(name.length));
                    if (name.startsWith('@')) {
                        subname = dir.getRoot(resource);
                        resource = dir.trimStart(resource.substring(subname.length));
                        name = "".concat(name, "/").concat(subname);
                    }
                    paths = NodeModulePaths.getPaths(current_, name);
                    loaderType = null;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < paths.length)) return [3 /*break*/, 4];
                    path_2 = paths[i];
                    return [4 /*yield*/, Helper_1.Helper.XHR_LOAD(path_2)];
                case 2:
                    resp = _a.sent();
                    if (resp.status !== 200) {
                        return [3 /*break*/, 3];
                    }
                    if (!resource) {
                        json = void 0;
                        text = resp.body;
                        if (typeof text === 'string') {
                            json = JSON.parse(text);
                        }
                        else {
                            json = text;
                        }
                        resource = global_1.isBrowser && json.browser ? json.browser : json.main;
                        if (json.type === 'module') {
                            loaderType = 'import';
                        }
                    }
                    if ((0, path_1.path_hasExtension)(resource) === false) {
                        resource += '.js';
                    }
                    main = (0, path_1.path_combine)(path_2.replace('package.json', ''), resource);
                    cb(null, main, loaderType);
                    return [2 /*return*/];
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    cb('Not found');
                    return [2 /*return*/];
            }
        });
    });
}
function nodeModuleResolveOld(current_, path, cb) {
    var name = /^(@?[\w\-]+)/.exec(path)[0];
    var resource = path.substring(name.length + 1);
    if (resource && (0, path_1.path_hasExtension)(resource) === false) {
        resource += '.js';
    }
    var current = current_.replace(/[^\/]+\.[\w]{1,8}$/, '');
    function check() {
        var dir = (0, path_1.path_combine)(current, '/node_modules/', name, '/');
        var filename = dir + 'package.json';
        Helper_1.Helper.XHR_LOAD(filename, function (error, text) {
            var json;
            if (text) {
                if (typeof text === 'string') {
                    try {
                        json = JSON.parse(text);
                    }
                    catch (error) { }
                }
                else {
                    json = text;
                }
            }
            if (error != null || json == null) {
                var next = current.replace(/[^\/]+\/?$/, '');
                if (next === current) {
                    cb('Not found');
                    return;
                }
                current = next;
                check();
                return;
            }
            if (resource) {
                cb(null, (0, path_1.path_combine)(dir, resource));
                return;
            }
            var main = global_1.isBrowser && json.browser ? json.browser : json.main;
            if (main) {
                combineMain(dir, main, cb);
                return;
            }
            cb(null, dir + 'index.js');
        });
    }
    check();
}
function ensureExtension(path, type) {
    if ((0, path_1.path_hasExtension)(path)) {
        return path;
    }
    var ext = _ext[type];
    if (ext == null) {
        console.warn('Extension is not defined for ' + type);
        return path;
    }
    var i = path.indexOf('?');
    if (i === -1) {
        return path + '.' + ext;
    }
    return path.substring(0, i) + '.' + ext + path.substring(i);
}
function getTypeForPath(path) {
    var aliasIdx = path.indexOf('::');
    if (aliasIdx > -1) {
        path = path.substring(0, aliasIdx);
    }
    if (isNodeModuleResolution(path)) {
        return Type_1.ResourceType.Js;
    }
    path = map(path);
    var match = /\.([\w]{1,8})($|\?|:)/.exec(path);
    if (match === null) {
        return _extTypes.js;
    }
    var ext = match[1];
    var type = _extTypes[ext];
    return type || Type_1.ResourceType.Load;
}
function combineMain(dir, fileName, cb) {
    var path = (0, path_1.path_combine)(dir, fileName);
    if ((0, path_1.path_hasExtension)(path)) {
        cb(null, path);
        return;
    }
    var url = path + '.js';
    Helper_1.Helper.XHR_LOAD(url, function (error, text) {
        if (error == null) {
            cb(null, url);
            return;
        }
        url = path + '/index.js';
        Helper_1.Helper.XHR_LOAD(url, function (error, text) {
            if (error == null) {
                cb(null, url);
                return;
            }
            cb('Entry File does not exist: ' + fileName + ' in ' + dir);
        });
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_PathResolver === module.exports) {
        // do nothing if
    } else if (__isObj(_src_PathResolver) && __isObj(module.exports)) {
        Object.assign(_src_PathResolver, module.exports);
    } else {
        _src_PathResolver = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_res;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_utils_res != null ? _src_utils_res : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.res_setState = exports.res_groupByType = void 0;
var PathResolver_1 = _src_PathResolver;
function res_groupByType(arr) {
    var pckg = {}, imax = arr.length, i = -1;
    while (++i < imax) {
        var path = arr[i];
        var type = PathResolver_1.PathResolver.getType(path);
        append(pckg, type, path);
    }
    return pckg;
}
exports.res_groupByType = res_groupByType;
;
function res_setState(res, state) {
    if (typeof res.state === 'number' && res.state >= state) {
        return;
    }
    res.state = state;
}
exports.res_setState = res_setState;
function append(pckg, type, path) {
    var arr = pckg[type];
    if (arr == null) {
        arr = pckg[type] = [];
    }
    arr.push(path);
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_utils_res === module.exports) {
        // do nothing if
    } else if (__isObj(_src_utils_res) && __isObj(module.exports)) {
        Object.assign(_src_utils_res, module.exports);
    } else {
        _src_utils_res = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_ScriptStack;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_ScriptStack != null ? _src_ScriptStack : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptStack = void 0;
var Config_1 = _src_Config;
var Helper_1 = _src_Helper;
var global_1 = _src_global;
var res_1 = _src_utils_res;
var class_Dfr_1 = _src_utils_class_Dfr;
var head;
var currentResource;
var stack = [];
var completeAllCbs = [];
var isPaused = false;
var Loaders;
(function (Loaders) {
    function ensureType(resource) {
        var loaderType = resource.loaderType;
        if (loaderType == null) {
            if (!Config_1.cfg.eval) {
                loaderType = 'embed';
            }
            else {
                loaderType = 'eval';
            }
            resource.loaderType = loaderType;
        }
        return loaderType;
    }
    Loaders.ensureType = ensureType;
    function byEmbed(resource, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var url, tag;
            return __generator(this, function (_a) {
                url = resource.url;
                if (Config_1.cfg.version) {
                    url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Config_1.cfg.version;
                }
                if (url[0] === '/' && Config_1.cfg.lockedToFolder === true) {
                    url = url.substring(1);
                }
                tag = document.createElement('script');
                tag.type = 'text/javascript';
                tag.src = url;
                if ('onreadystatechange' in tag) {
                    tag.onreadystatechange = function () {
                        if (this.readyState === 'complete' || this.readyState === 'loaded') {
                            callback();
                        }
                    };
                }
                else {
                    tag.onload = tag.onerror = callback;
                }
                if (head == null) {
                    head = document.getElementsByTagName('head')[0];
                }
                head.appendChild(tag);
                return [2 /*return*/];
            });
        });
    }
    Loaders.byEmbed = byEmbed;
    function byEval(resource, callback) {
        SourceLoader.load(resource, function () {
            currentResource = resource;
            currentResource.state = Config_1.cfg.sync ? 3 : 1;
            global.include = resource;
            global_1.refs.evaluate(resource.source, resource);
            callback();
        });
    }
    Loaders.byEval = byEval;
    function byImport(resource, callback) {
        import(resource.url).then(function (result) {
            resource.exports = result;
            callback();
        }, function (error) {
            var _a, _b;
            console.error('Not Loaded:', resource.url);
            console.error('- Initiator:', (_b = (_a = resource.parent) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : '<root resource>');
            resource.error = error;
            callback();
        });
    }
    Loaders.byImport = byImport;
})(Loaders || (Loaders = {}));
function stackRemove(resource) {
    var imax = stack.length, i = -1;
    while (++i < imax) {
        if (stack[i] === resource) {
            stack.splice(i, 1);
            return;
        }
    }
}
function trigger_complete() {
    if (completeAllCbs.length === 0) {
        return;
    }
    var arr = completeAllCbs;
    completeAllCbs = [];
    for (var i = 0; i < arr.length; i++) {
        arr[i]();
    }
}
function tickStack() {
    if (isPaused) {
        return;
    }
    if (stack.length === 0) {
        trigger_complete();
        return;
    }
    if (currentResource != null) {
        return;
    }
    var resource = stack[0];
    currentResource = resource;
    currentResource.state = 1;
    global.include = resource;
    var loaderType = resource.loaderType;
    if (loaderType === 'embed') {
        Loaders.byEmbed(resource, function () { return onResourceLoaded(resource); });
        return;
    }
    if (loaderType === 'eval') {
        Loaders.byEval(resource, function () { return onResourceLoaded(resource); });
        return;
    }
    if (loaderType === 'import') {
        Loaders.byImport(resource, function () { return onResourceLoaded(resource); });
        return;
    }
    throw new Error("Invalid type ".concat(loaderType));
}
function onResourceLoaded(resource) {
    stackRemove(resource);
    if (resource.state !== 2.5) {
        resource.readystatechanged(3);
    }
    currentResource = null;
    tickStack();
}
exports.ScriptStack = {
    load: function (resource, parent) {
        var loaderType = Loaders.ensureType(resource);
        if (loaderType === 'eval') {
            SourceLoader.prefetch(resource);
            if (Config_1.cfg.sync === true) {
                Loaders.byEval(resource, function () {
                    resource.readystatechanged(3);
                });
                tickStack();
                return;
            }
        }
        exports.ScriptStack.add(resource, parent);
        tickStack();
    },
    add: function (resource, parent) {
        if (resource.priority === 1) {
            stack.unshift(resource);
            return;
        }
        if (parent == null) {
            stack.push(resource);
            return;
        }
        var imax = stack.length;
        var i = -1;
        // move close to parent
        while (++i < imax) {
            if (stack[i] === parent) {
                stack.splice(i, 0, resource);
                return;
            }
        }
        // was still not added
        stack.push(resource);
    },
    /* Move resource in stack close to parent */
    moveToParent: function (resource, parent) {
        var length = stack.length, parentIndex = -1, resourceIndex = -1, i;
        for (i = 0; i < length; i++) {
            if (stack[i] === resource) {
                resourceIndex = i;
                break;
            }
        }
        if (resourceIndex === -1) {
            return;
        }
        for (i = 0; i < length; i++) {
            if (stack[i] === parent) {
                parentIndex = i;
                break;
            }
        }
        if (parentIndex === -1) {
            return;
        }
        if (resourceIndex < parentIndex) {
            return;
        }
        stack.splice(resourceIndex, 1);
        stack.splice(parentIndex, 0, resource);
    },
    pause: function () {
        isPaused = true;
    },
    resume: function () {
        isPaused = false;
        if (currentResource != null)
            return;
        this.touch();
    },
    touch: function () {
        tickStack();
    },
    complete: function (callback) {
        if (isPaused !== true && stack.length === 0) {
            callback();
            return;
        }
        completeAllCbs.push(callback);
    }
};
var SourceLoader;
(function (SourceLoader) {
    var progress = [];
    function prefetch(resource) {
        load(resource);
    }
    SourceLoader.prefetch = prefetch;
    function load(resource, callback) {
        if (resource.source) {
            if (resource.state <= 2) {
                resource.state = 2;
            }
            callback === null || callback === void 0 ? void 0 : callback();
        }
        var dfr = doLoad(resource);
        if (callback) {
            dfr.then(function (source) {
                resource.source = source;
                (0, res_1.res_setState)(resource, 2);
                delete progress[resource.url];
                callback(resource);
            }, function (err) {
                throw err;
            });
        }
    }
    SourceLoader.load = load;
    function doLoad(resource) {
        var dfr = progress[resource.url];
        if (dfr) {
            return dfr;
        }
        dfr = progress[resource.url] = new class_Dfr_1.class_Dfr();
        Helper_1.Helper.XHR(resource, function (resource, response) {
            var _a, _b;
            if (!response) {
                console.error('Not Loaded:', resource.url);
                console.error('- Initiator:', (_b = (_a = resource.parent) === null || _a === void 0 ? void 0 : _a.url) !== null && _b !== void 0 ? _b : '<root resource>');
                if (resource.error) {
                    console.error(resource.error);
                }
            }
            dfr.resolve(response);
        });
        return dfr;
    }
})(SourceLoader || (SourceLoader = {}));
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_ScriptStack === module.exports) {
        // do nothing if
    } else if (__isObj(_src_ScriptStack) && __isObj(module.exports)) {
        Object.assign(_src_ScriptStack, module.exports);
    } else {
        _src_ScriptStack = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Include;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Include != null ? _src_Include : {};
    var module = { exports: exports };

    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Include = void 0;
var Type_1 = _src_models_Type;
var IncludeDeferred_1 = _src_IncludeDeferred;
var global_1 = _src_global;
var Config_1 = _src_Config;
var Routing_1 = _src_Routing;
var Bin_1 = _src_Bin;
var path_1 = _src_utils_path;
var CustomLoader_1 = _src_CustomLoader;
var Helper_1 = _src_Helper;
var ScriptStack_1 = _src_ScriptStack;
var Resource_1 = _src_Resource;
var global_2 = _src_global;
var Include = /** @class */ (function (_super) {
    __extends(Include, _super);
    function Include() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isBrowser = global_1.isBrowser;
        _this.isNode = global_1.isNode;
        _this.isRoot = false;
        _this.Lib = global_1.IncludeLib;
        _this.bin_tryReload = Bin_1.bin_tryReload;
        _this.bin_remove = Bin_1.bin_remove;
        return _this;
    }
    Include.prototype.setCurrent = function (data) {
        var url = data.url, resource = this.getResourceById(url, 'js');
        if (resource == null) {
            if (url[0] === '/' && this.base)
                url = this.base + url.substring(1);
            resource = new Resource_1.Resource('js', { path: url }, data.namespace, null, null, url);
        }
        if (resource.state < 3) {
            console.error("<include> Resource should be loaded", data);
        }
        if (data.aliases) {
            data.aliases.forEach(function (alias) {
                Bin_1.Bin.add(Type_1.ResourceType.Js, alias, resource);
            });
        }
        /**@TODO - probably state shoulb be changed to 2 at this place */
        resource.state = 3;
        global_2.global.include = resource;
    };
    Include.prototype.cfg = function (a, b) {
        return Config_1.cfg.call(this, a, b);
    };
    Include.prototype.routes = function (mix) {
        if (mix == null) {
            return Routing_1.Routes.getRoutes();
        }
        if (arguments.length === 2) {
            Routing_1.Routes.register(mix, arguments[1]);
            return this;
        }
        for (var key in mix) {
            Routing_1.Routes.register(key, mix[key]);
        }
        return this;
    };
    Include.prototype.promise = function (namespace) {
        var arr = namespace.split('.');
        var obj = global_2.global;
        while (arr.length) {
            var key = arr.shift();
            obj = obj[key] || (obj[key] = {});
        }
        return obj;
    };
    /** @TODO - `id` property seems to be unsed and always equal to `url` */
    Include.prototype.register = function (_bin) {
        var base = this.base;
        function transform(info) {
            if (base == null)
                return info;
            if (info.url[0] === '/') {
                info.url = base + info.url.substring(1);
            }
            if (info.parent[0] === '/') {
                info.parent = base + info.parent.substring(1);
            }
            info.id = info.url;
            return info;
        }
        for (var key in _bin) {
            var infos = _bin[key];
            var imax = infos.length;
            var i = -1;
            while (++i < imax) {
                var info = transform(infos[i]);
                var id = info.url;
                var url = info.url;
                var namespace = info.namespace;
                var parent = info.parent && Bin_1.Bin.find(info.parent);
                var resource = new Resource_1.Resource();
                var state = info.state;
                if (!id || !url) {
                    continue;
                }
                if (url) {
                    if (url[0] === '/') {
                        url = url.substring(1);
                    }
                    resource.location = (0, path_1.path_getDir)(url);
                }
                resource.state = state == null
                    ? (key === 'js' ? 3 : 4)
                    : state;
                resource.namespace = namespace;
                resource.type = key;
                resource.url = url || id;
                resource.parent = parent;
                resource.base = parent && parent.base || base;
                switch (key) {
                    case 'load':
                    case 'lazy':
                        var query = '[data-bundler-path="/' + url + '"]';
                        var bags = global_1.IncludeLib.loadBags, j = bags.length, el = null;
                        while (--j > -1 && el == null) {
                            if (bags[j] == null)
                                continue;
                            el = bags[j].querySelector(query);
                        }
                        if (el == null) {
                            console.error('"%s" Data was not embedded into html', id);
                            break;
                        }
                        resource.exports = el.innerHTML;
                        if (CustomLoader_1.CustomLoader.exists(resource)) {
                            resource.state = 3;
                            CustomLoader_1.CustomLoader.load(resource, CustomLoader_onComplete);
                        }
                        break;
                }
                Bin_1.Bin.add(key, id, resource);
            }
        }
        function CustomLoader_onComplete(resource, response) {
            resource.exports = response;
            resource.readystatechanged(4);
        }
    };
    /**
     *    Create new Resource Instance,
     *    as sometimes it is necessary to call include. on new empty context
     */
    Include.prototype.instance = function (url, parent) {
        return Include.instance(url, parent);
    };
    Include.instance = function (url, parent) {
        if (url == null) {
            var resource_1 = new Include();
            resource_1.isRoot = true;
            resource_1.state = 4;
            return resource_1;
        }
        var resource = new Resource_1.Resource('js');
        resource.state = 4;
        resource.url = (0, path_1.path_resolveUrl)(url, parent);
        resource.location = (0, path_1.path_getDir)(resource.url);
        resource.parent = parent;
        resource.isRoot = true;
        return resource;
    };
    Include.prototype.noConflict = function () {
        (0, global_2.noConflict)();
    };
    Include.prototype.getResource = function (url, type) {
        if (this.base && url[0] === '/')
            url = this.base + url.substring(1);
        return this.getResourceById(url, type);
    };
    Include.prototype.getResourceById = function (url, type) {
        var _res = Bin_1.Bin.get(type, url);
        if (_res != null)
            return _res;
        if (this.base && url[0] === '/') {
            _res = Bin_1.Bin.get(type, (0, path_1.path_combine)(this.base, url));
            if (_res != null)
                return _res;
        }
        if (this.base && this.location) {
            _res = Bin_1.Bin.get(type, (0, path_1.path_combine)(this.base, this.location, url));
            if (_res != null)
                return _res;
        }
        if (this.location) {
            _res = Bin_1.Bin.get(null, (0, path_1.path_combine)(this.location, url));
            if (_res != null)
                return _res;
        }
        return null;
    };
    Include.prototype.getResources = function () {
        return Bin_1.bin;
    };
    Include.prototype.removeFromCache = function (path) {
        Bin_1.Bin.remove(path);
    };
    Include.prototype.plugin = function (pckg, callback) {
        var urls = [], length = 0, j = 0, i = 0, onload = function (url, response) {
            j++;
            embedPlugin(response);
            if (j === length - 1 && callback) {
                callback();
                callback = null;
            }
        };
        Routing_1.Routes.each(null, pckg, function (namespace, route) {
            urls.push(route.path[0] === '/' ? route.path.substring(1) : route.path);
        });
        length = urls.length;
        for (; i < length; i++) {
            Helper_1.Helper.XHR(urls[i], onload);
        }
        return this;
    };
    Include.prototype.client = function () {
        if (Config_1.cfg.server === true)
            stub_freeze(this);
        return this;
    };
    Include.prototype.server = function () {
        if (Config_1.cfg.server !== true)
            stub_freeze(this);
        return this;
    };
    Include.prototype.use = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.parent == null) {
            console.error('<include.use> Parent resource is undefined');
            return this;
        }
        this._usage = args;
        return this;
    };
    Include.prototype.pauseStack = function () {
        return ScriptStack_1.ScriptStack.pause();
    };
    Include.prototype.resumeStack = function () {
        return ScriptStack_1.ScriptStack.resume();
    };
    Include.prototype.allDone = function (callback) {
        ScriptStack_1.ScriptStack.complete(function () {
            var pending = include.getPending(), await_ = pending.length;
            if (await_ === 0) {
                callback();
                return;
            }
            var i = -1, imax = await_;
            while (++i < imax) {
                pending[i].on(4, check, null, 'push');
            }
            function check() {
                if (--await_ < 1)
                    callback();
            }
        });
    };
    Include.prototype.getPending = function (type) {
        var resources = [], res, key, id;
        for (key in Bin_1.bin) {
            if (key === 'all' || (type != null && type !== key))
                continue;
            for (id in Bin_1.bin[key]) {
                res = Bin_1.bin[key][id];
                if (res.state < 4)
                    resources.push(res);
            }
        }
        return resources;
    };
    Include.prototype.js = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).js.apply(_a, args);
    };
    Include.prototype.inject = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).inject.apply(_a, args);
    };
    Include.prototype.css = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).css.apply(_a, args);
    };
    Include.prototype.load = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).load.apply(_a, args);
    };
    Include.prototype.ajax = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).ajax.apply(_a, args);
    };
    Include.prototype.embed = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).embed.apply(_a, args);
    };
    Include.prototype.lazy = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).lazy.apply(_a, args);
    };
    Include.prototype.mask = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).mask.apply(_a, args);
    };
    Include.prototype.include = function (type, pckg, options) {
        return new Resource_1.Resource(Type_1.ResourceType.Js).include(type, pckg, options);
    };
    return Include;
}(IncludeDeferred_1.IncludeDeferred));
exports.Include = Include;
;
// >> FUNCTIONS
function embedPlugin(source) {
    eval(source);
}
function doNothing() {
    return this;
}
function stub_freeze(include) {
    include.js =
        include.css =
            include.load =
                include.ajax =
                    include.embed =
                        include.lazy =
                            include.inject =
                                include.mask = doNothing;
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Include === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Include) && __isObj(module.exports)) {
        Object.assign(_src_Include, module.exports);
    } else {
        _src_Include = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_LazyModule;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_LazyModule != null ? _src_LazyModule : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LazyModule = void 0;
var Helper_1 = _src_Helper;
var Resource_1 = _src_Resource;
var global_1 = _src_global;
exports.LazyModule = {
    create: function (xpath, code) {
        console.log('WARN: LazyModule is obsolete');
        var arr = xpath.split('.'), obj = global, module = arr[arr.length - 1];
        while (arr.length > 1) {
            var prop = arr.shift();
            obj = obj[prop] || (obj[prop] = {});
        }
        arr = null;
        Object.defineProperty(obj, module, {
            get: function () {
                delete obj[module];
                try {
                    var r = global_1.refs.evaluate(code, global.include);
                    if (!(r == null || r instanceof Resource_1.Resource)) {
                        obj[module] = r;
                    }
                }
                catch (error) {
                    error.xpath = xpath;
                    Helper_1.Helper.reportError(error);
                }
                finally {
                    code = null;
                    xpath = null;
                    return obj[module];
                }
            }
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_LazyModule === module.exports) {
        // do nothing if
    } else if (__isObj(_src_LazyModule) && __isObj(module.exports)) {
        Object.assign(_src_LazyModule, module.exports);
    } else {
        _src_LazyModule = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Resource;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Resource != null ? _src_Resource : {};
    var module = { exports: exports };

    "use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
var global_1 = _src_global;
var Include_1 = _src_Include;
var Bin_1 = _src_Bin;
var path_1 = _src_utils_path;
var PathResolver_1 = _src_PathResolver;
var ScriptStack_1 = _src_ScriptStack;
var global_2 = _src_global;
var res_1 = _src_utils_res;
var Routing_1 = _src_Routing;
var CustomLoader_1 = _src_CustomLoader;
var Helper_1 = _src_Helper;
var LazyModule_1 = _src_LazyModule;
var Type_1 = _src_models_Type;
var Config_1 = _src_Config;
var global_3 = _src_global;
var Resource = /** @class */ (function (_super) {
    __extends(Resource, _super);
    function Resource(type, route, namespace, xpath, parent, id, priority, opts) {
        if (type === void 0) { type = null; }
        if (route === void 0) { route = null; }
        if (namespace === void 0) { namespace = null; }
        if (xpath === void 0) { xpath = null; }
        if (parent === void 0) { parent = null; }
        if (id === void 0) { id = null; }
        if (priority === void 0) { priority = null; }
        if (opts === void 0) { opts = null; }
        var _this = _super.call(this) || this;
        var url = route === null || route === void 0 ? void 0 : route.path;
        if (url != null) {
            url = (0, path_1.path_normalize)(url);
            url = PathResolver_1.PathResolver.resolveBasic(url, type, parent);
        }
        if (id == null && url) {
            id = url;
        }
        var resource = Bin_1.Bin.get(type, id);
        var isOfOtherType = false;
        if (resource) {
            if (type === 'js' && resource.state < 4) {
                ScriptStack_1.ScriptStack.moveToParent(resource, parent);
            }
            isOfOtherType = type != null && resource.type === 'load' && type !== 'load';
            if (isOfOtherType === false) {
                return resource;
            }
        }
        _this.id = id;
        _this.url = url;
        _this.type = type;
        _this.xpath = xpath;
        _this.route = route;
        _this.parent = parent;
        _this.priority = priority;
        _this.namespace = namespace;
        _this.base = parent && parent.base;
        _this.childLoaded = _this.childLoaded.bind(_this);
        _this.response = {};
        _this.exports = {};
        _this.options = opts;
        if (type == null) {
            _this.state = 3;
            return _this;
        }
        if (type === 'embed') {
            _this.loaderType = 'embed';
        }
        if (url == null) {
            _this.state = 3;
            _this.url = (0, path_1.path_resolveCurrent)();
            _this.location = (0, path_1.path_getDir)(_this.url);
            return _this;
        }
        _this.state = 0;
        _this.location = (0, path_1.path_getDir)(url);
        Bin_1.Bin.add(type, id, _this);
        if (isOfOtherType) {
            onXHRCompleted(_this, resource.exports);
        }
        var isNpm = PathResolver_1.PathResolver.isNpm(_this.url);
        if (isNpm && global_2.isNode) {
            var before = global_1.global.include;
            global_1.global.include = _this;
            try {
                _this.exports = global_2.__require.nativeRequire(_this.url);
                if (before != null && global_1.global.include === _this) {
                    global_1.global.include = before;
                }
                _this.readystatechanged(4);
            }
            catch (error) {
                if (error.code == 'ERR_REQUIRE_ESM') {
                    _this.loaderType = 'import';
                    process(_this);
                    return _this;
                }
                throw error;
            }
            return _this;
        }
        if (isNpm === false) {
            process(_this);
            return _this;
        }
        PathResolver_1.PathResolver.resolveNpm(_this.url, _this.type, _this.parent, function (error, url, loaderType) {
            if (error) {
                _this.readystatechanged(4);
                return;
            }
            if (loaderType) {
                _this.loaderType = loaderType;
            }
            _this.url = url;
            _this.location = (0, path_1.path_getDir)(url);
            process(_this);
        });
        return _this;
    }
    Resource.prototype.setBase = function (baseUrl) {
        this.base = baseUrl;
        return this;
    };
    Resource.prototype.hasPendingChildren = function () {
        var arr = this.includes;
        if (arr == null) {
            return false;
        }
        var imax = arr.length, i = -1;
        while (++i < imax) {
            if (arr[i].isCyclic) {
                continue;
            }
            if (arr[i].resource.state !== 4) {
                return true;
            }
        }
        return false;
    };
    Resource.prototype.childLoaded = function (child) {
        var includes = this.includes;
        if (includes && includes.length) {
            if (this.state < 3) {
                // resource still loading/include is in process, but one of sub resources are already done
                return;
            }
            for (var i = 0; i < includes.length; i++) {
                var data = includes[i];
                if (data.isCyclic) {
                    continue;
                }
                if (data.resource.state !== 4) {
                    return;
                }
            }
        }
        this.readystatechanged(4);
    };
    Resource.prototype.create = function (type, route, namespace, xpath, id, options) {
        if (route === void 0) { route = null; }
        if (namespace === void 0) { namespace = null; }
        if (xpath === void 0) { xpath = null; }
        if (id === void 0) { id = null; }
        if (options === void 0) { options = null; }
        this.state = this.state >= 3
            ? 3
            : 2;
        if (this.includes == null) {
            this.includes = [];
        }
        var resource = new Resource(type, route, namespace, xpath, this, id, null, options);
        var isLazy = false;
        if (this.url && Config_1.cfg.lazy) {
            outer: for (var str in Config_1.cfg.lazy) {
                var rgx = new RegExp(str);
                if (rgx.test(this.url)) {
                    var paths = Config_1.cfg.lazy[str];
                    for (var i = 0; i < paths.length; i++) {
                        var rgxPath = new RegExp(paths[i]);
                        if (rgxPath.test(resource.url)) {
                            isLazy = true;
                            break outer;
                        }
                    }
                }
            }
        }
        var data = {
            resource: resource,
            route: route,
            isCyclic: isLazy || resource.contains(this.url),
            isLazy: isLazy
        };
        this.includes.push(data);
        return data;
    };
    Resource.prototype.include = function (type, pckg, options) {
        var _this = this;
        var children = [];
        var child;
        Routing_1.Routes.each(type, pckg, function (namespace, route, xpath) {
            if (_this.route != null && _this.route.path === route.path) {
                // loading itself
                return;
            }
            child = _this.create(type, route, namespace, xpath, null, options);
            children.push(child);
        });
        var i = -1;
        var imax = children.length;
        while (++i < imax) {
            var x = children[i];
            if (x.isCyclic) {
                this.childLoaded(x.resource);
                continue;
            }
            x.resource.on(4, this.childLoaded);
        }
        return this;
    };
    Resource.prototype.require = function (arr, options) {
        if (this.exports == null) {
            this.exports = {};
        }
        this.includes = [];
        var pckg = (0, res_1.res_groupByType)(arr);
        for (var key in pckg) {
            this.include(key, pckg[key], options);
        }
        return this;
    };
    Resource.prototype.pause = function () {
        this.state = 2.5;
        var that = this;
        return function (exports) {
            if (arguments.length === 1) {
                that.exports = exports;
            }
            that.readystatechanged(3);
        };
    };
    Resource.prototype.contains = function (url, stack, refCache) {
        if (stack === void 0) { stack = []; }
        if (refCache === void 0) { refCache = {}; }
        refCache[this.url] = this;
        var arr = this.includes;
        if (arr == null) {
            return false;
        }
        stack = __spreadArray(__spreadArray([], stack, true), [this], false);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].isLazy) {
                continue;
            }
            if (arr[i].resource.url in refCache) {
                continue;
            }
            if (arr[i].resource.url === url) {
                if (Config_1.cfg.logCyclic) {
                    var req = stack[0].url;
                    var chain = stack.slice(1).map(function (x, i) { return "".concat(i, " \u2192 ").concat(x.url); }).join('\n');
                    var isDirect = stack.length <= 1;
                    var message = "Caution: ".concat(isDirect ? 'Direct ' : '', " cyclic dependency detected. In ").concat(url, " was ").concat(req, " imported.");
                    if (isDirect === false) {
                        message += " The loop chain is: ".concat(chain);
                    }
                    console.log(message);
                }
                return true;
            }
            if (arr[i].resource.contains(url, stack, refCache)) {
                return true;
            }
        }
        return false;
    };
    Resource.prototype.getNestedOfType = function (type) {
        return resource_getChildren(this.includes, type);
    };
    Resource.prototype.js = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Js, PackageExtract(pckg), null);
    };
    Resource.prototype.inject = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Js, PackageExtract(pckg), null);
    };
    Resource.prototype.css = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Css, PackageExtract(pckg), null);
    };
    Resource.prototype.load = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Load, PackageExtract(pckg), null);
    };
    Resource.prototype.ajax = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Ajax, PackageExtract(pckg), null);
    };
    Resource.prototype.embed = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Embed, PackageExtract(pckg), null);
    };
    Resource.prototype.lazy = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Lazy, PackageExtract(pckg), null);
    };
    Resource.prototype.mask = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Mask, PackageExtract(pckg), null);
    };
    return Resource;
}(Include_1.Include));
exports.Resource = Resource;
;
function PackageExtract(pckg) {
    if (pckg.length > 1)
        return pckg;
    if (Array.isArray(pckg[0]))
        return pckg[0];
    return pckg;
}
// private
function process(resource) {
    var type = resource.type, url = resource.url, parent = resource.parent;
    if (global_3.document == null && type === 'css') {
        resource.state = 4;
        return resource;
    }
    if (CustomLoader_1.CustomLoader.exists(resource)) {
        if ('js' === type || 'embed' === type) {
            ScriptStack_1.ScriptStack.add(resource, resource.parent);
        }
        CustomLoader_1.CustomLoader.load(resource, onXHRCompleted);
        return resource;
    }
    switch (type) {
        case 'js':
        case 'embed':
            ScriptStack_1.ScriptStack.load(resource, parent);
            break;
        case 'ajax':
        case 'load':
        case 'lazy':
        case 'mask':
            Helper_1.Helper.XHR(resource, onXHRCompleted);
            break;
        case 'css':
            resource.state = 4;
            var tag = global_3.document.createElement('link');
            tag.href = url;
            tag.rel = "stylesheet";
            tag.type = "text/css";
            global_3.document.body.appendChild(tag);
            break;
    }
    return resource;
}
function onXHRCompleted(resource, response) {
    if (!response) {
        console.warn('Resource can`t be loaded', resource.url);
        //- resource.readystatechanged(4);
        //- return;
    }
    switch (resource.type) {
        case 'js':
        case 'embed':
            resource.source = response;
            resource.state = 2;
            ScriptStack_1.ScriptStack.touch();
            return;
        case 'load':
        case 'ajax':
        case 'mask':
            resource.exports = response;
            break;
        case 'lazy':
            LazyModule_1.LazyModule.create(resource.xpath, response);
            break;
        case 'css':
            var tag = global_3.document.createElement('style');
            tag.type = "text/css";
            tag.innerHTML = response;
            global_3.document.getElementsByTagName('head')[0].appendChild(tag);
            break;
        // case 'mask':
        //     if (response) {
        //         let mask = global.mask;
        //         if (mask == null) {
        //             mask = global.require('maskjs');
        //         }
        //         mask
        //             .Module
        //             .registerModule(response, { path: resource.url })
        //             .done(function (module) {
        //                 resource.exports = module.exports;
        //                 resource.readystatechanged(4);
        //             })
        //             .fail(function (error) {
        //                 console.error(error);
        //                 resource.readystatechanged(4);
        //             });
        //         return;
        //     }
        //     break;
    }
    resource.readystatechanged(4);
}
function resource_getChildren(includes, type, out) {
    if (out === void 0) { out = []; }
    if (includes == null)
        return null;
    var imax = includes.length, i = -1, x;
    while (++i < imax) {
        x = includes[i].resource;
        if (type === x.type)
            out.push(x);
        if (x.includes != null)
            resource_getChildren(x.includes, type, out);
    }
    return out;
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Resource === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Resource) && __isObj(module.exports)) {
        Object.assign(_src_Resource, module.exports);
    } else {
        _src_Resource = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_worker_WorkerClient;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_worker_WorkerClient != null ? _src_worker_WorkerClient : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerClientNode = exports.WorkerWrapper = void 0;
var global_1 = _src_global;
var WorkerWrapper = /** @class */ (function () {
    function WorkerWrapper(workerFilename) {
        this.worker = new WorkerClientNode(workerFilename);
    }
    WorkerWrapper.prototype.loadScript = function (filename) {
        return __awaiter(this, void 0, void 0, function () {
            var scriptExportsMeta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.worker.call('loadScript', {
                            filename: filename
                        })];
                    case 1:
                        scriptExportsMeta = _a.sent();
                        console.log('scriptExportsMeta', scriptExportsMeta);
                        return [2 /*return*/, WorkerRpcProxyUtils.wrapExportsMeta(this, filename, scriptExportsMeta)];
                }
            });
        });
    };
    WorkerWrapper.prototype.call = function (filename, accessorPath) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.worker.call('call', {
                            method: accessorPath,
                            args: args
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return WorkerWrapper;
}());
exports.WorkerWrapper = WorkerWrapper;
var WorkerRpcProxyUtils;
(function (WorkerRpcProxyUtils) {
    function wrapExportsMeta(worker, filename, scriptExportsMeta) {
        return createObject(worker, filename, null, scriptExportsMeta);
    }
    WorkerRpcProxyUtils.wrapExportsMeta = wrapExportsMeta;
    function createMethod(worker, filename, accessorPath) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, worker.call.apply(worker, __spreadArray([filename, accessorPath], args, false))];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
    }
    function createClass(worker, filename, accessorPath) {
        throw new Error('Class RPC Not implemented yet');
    }
    function createObject(worker, filename, accessorPath, exports) {
        var obj = {};
        for (var key in exports) {
            var exp = exports[key];
            var path = accessorPath ? "".concat(accessorPath, ".").concat(key) : key;
            if (exp.type === 'function') {
                obj[key] = createMethod(worker, filename, path);
                continue;
            }
            if (exp.type === 'class') {
                obj[key] = createClass(worker, filename, key);
                continue;
            }
            if (exp.type === 'object') {
                obj[key] = createObject(worker, filename, key, exp.object);
                continue;
            }
            throw new Error("Exported type is unsupported");
        }
        return obj;
    }
})(WorkerRpcProxyUtils || (WorkerRpcProxyUtils = {}));
var WorkerClientNode = /** @class */ (function () {
    function WorkerClientNode(workerFilename) {
        var _this = this;
        this.awaiters = Object.create(null);
        var Worker = global_1.global.require('worker_threads').Worker;
        var cwd = process.cwd();
        var host = "include.node-worker-host.js";
        var isDev = /(include|includejs)$/.test(cwd);
        var path = workerFilename !== null && workerFilename !== void 0 ? workerFilename : (isDev ? "".concat(cwd, "/lib/").concat(host) : "".concat(cwd, "/node_modules/includejs/lib/").concat(host));
        this.child = new Worker(path);
        this.child.on('message', function (resp) {
            if (resp.id == null || resp.id in _this.awaiters === false) {
                return;
            }
            var awaiter = _this.awaiters[resp.id];
            delete _this.awaiters[resp.id];
            if (resp.error) {
                awaiter.promise.reject(resp.error);
                return;
            }
            awaiter.promise.resolve(resp.data);
        });
    }
    WorkerClientNode.prototype.call = function (method) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log('CALLING', method);
        var promise = new DfrWrapped;
        var id = (Math.round(Math.random() * Math.pow(10, 10))) + '' + Date.now();
        this.awaiters[id] = {
            timestamp: Date.now(),
            promise: promise
        };
        this.child.postMessage({
            id: id,
            method: method,
            args: args
        });
        if (this.timeoutMs) {
            setTimeout(function () { return _this.checkTimeout(); }, this.timeoutMs);
        }
        return promise.promise;
    };
    WorkerClientNode.prototype.checkTimeout = function () {
        var _this = this;
        var now = Date.now();
        var keys = [];
        for (var key in this.awaiters) {
            var bin = this.awaiters[key];
            var ms = now - bin.timestamp;
            if (ms >= this.timeoutMs) {
                try {
                    bin.promise.reject(new Error('Timeouted'));
                }
                catch (error) { }
                keys.push(key);
            }
        }
        keys.forEach(function (key) { return delete _this.awaiters[key]; });
    };
    WorkerClientNode.prototype.onError = function (error) {
        var obj = Object.create(this.awaiters);
        this.awaiters = {};
        for (var key in obj) {
            var bin = obj[key];
            try {
                bin.promise.reject(error);
            }
            catch (error) { }
        }
    };
    WorkerClientNode.prototype.onStdError = function (str) {
        this.onError(new Error(str));
    };
    return WorkerClientNode;
}());
exports.WorkerClientNode = WorkerClientNode;
var DfrWrapped = /** @class */ (function () {
    function DfrWrapped() {
        var _this = this;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    }
    return DfrWrapped;
}());
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_worker_WorkerClient === module.exports) {
        // do nothing if
    } else if (__isObj(_src_worker_WorkerClient) && __isObj(module.exports)) {
        Object.assign(_src_worker_WorkerClient, module.exports);
    } else {
        _src_worker_WorkerClient = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_worker_WorkerLoader;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_worker_WorkerLoader != null ? _src_worker_WorkerLoader : {};
    var module = { exports: exports };

    "use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerLoader = void 0;
var WorkerClient_1 = _src_worker_WorkerClient;
var WorkerLoader = /** @class */ (function () {
    function WorkerLoader() {
    }
    WorkerLoader.prototype.supports = function (url) {
        return /\.worker\./i.test(url);
    };
    WorkerLoader.prototype.process = function (exports, resource, onComplete) {
        console.log('WorkerLoader.process');
    };
    WorkerLoader.prototype.load = function (resource, onComplete) {
        return __awaiter(this, void 0, void 0, function () {
            var client, exports;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('WorkerLoader.load', resource.url);
                        client = new WorkerClient_1.WorkerWrapper();
                        return [4 /*yield*/, client.loadScript(resource.url)];
                    case 1:
                        exports = _a.sent();
                        console.log('LOADED', exports);
                        onComplete(exports, resource);
                        return [2 /*return*/];
                }
            });
        });
    };
    return WorkerLoader;
}());
exports.WorkerLoader = WorkerLoader;
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_worker_WorkerLoader === module.exports) {
        // do nothing if
    } else if (__isObj(_src_worker_WorkerLoader) && __isObj(module.exports)) {
        Object.assign(_src_worker_WorkerLoader, module.exports);
    } else {
        _src_worker_WorkerLoader = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_CustomLoader;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_CustomLoader != null ? _src_CustomLoader : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLoader = exports.inject = void 0;
var path_1 = _src_utils_path;
var Resource_1 = _src_Resource;
var Routing_1 = _src_Routing;
var Helper_1 = _src_Helper;
var WorkerLoader_1 = _src_worker_WorkerLoader;
var cfg = null;
var workerLoader = new WorkerLoader_1.WorkerLoader();
function inject(cfg_) {
    cfg = cfg_;
}
exports.inject = inject;
;
function loader_isInstance(x) {
    if (typeof x === 'string')
        return false;
    return typeof x.ready === 'function' || typeof x.process === 'function';
}
function createLoader(url, options) {
    if (workerLoader.supports(url) && (options === null || options === void 0 ? void 0 : options.skipWorker) !== true) {
        return workerLoader;
    }
    var extension = (0, path_1.path_getExtension)(url);
    var loader = cfg.loader[extension];
    if (loader_isInstance(loader)) {
        return loader;
    }
    var path = loader;
    var namespace;
    if (typeof path === 'object') {
        // is route {namespace: path}
        for (var key in path) {
            namespace = key;
            path = path[key];
            break;
        }
    }
    return (cfg.loader[extension] = new Resource_1.Resource('js', Routing_1.Routes.resolve(namespace, path), namespace, null, null, null, 1));
}
function loader_completeDelegate(callback, resource) {
    return function (response) {
        callback(resource, response);
    };
}
function loader_process(source, resource, loader, callback) {
    if (loader.process == null) {
        callback(resource, source);
        return;
    }
    var delegate = loader_completeDelegate(callback, resource);
    var syncResponse = loader.process(source, resource, delegate);
    // match also null
    if (typeof syncResponse !== 'undefined') {
        callback(resource, syncResponse);
    }
}
function tryLoad(resource, loader, callback) {
    if (typeof resource.exports === 'string') {
        loader_process(resource.exports, resource, loader, callback);
        return;
    }
    function onLoad(resource, response) {
        loader_process(response, resource, loader, callback);
    }
    if (loader.load) {
        return loader.load(resource, onLoad);
    }
    Helper_1.Helper.XHR(resource, onLoad);
}
exports.CustomLoader = {
    load: function (resource, callback) {
        var loader = createLoader(resource.url, resource.options);
        if (loader.process) {
            tryLoad(resource, loader, callback);
            return;
        }
        loader.on(4, function () {
            tryLoad(resource, loader.exports, callback);
        }, null, 'push');
    },
    exists: function (resource) {
        var _a, _b;
        if (!resource.url) {
            return false;
        }
        if (workerLoader.supports(resource.url) && ((_a = resource.options) === null || _a === void 0 ? void 0 : _a.skipWorker) !== true) {
            return true;
        }
        var ext = (0, path_1.path_getExtension)(resource.url);
        var loader = cfg.loader[ext];
        if (loader == null) {
            return false;
        }
        if (((_b = loader.supports) === null || _b === void 0 ? void 0 : _b.call(loader, resource)) === false) {
            return false;
        }
        return true;
    },
    /**
     *    IHandler:
     *    { process (content) { return _handler(content); }; }
     *
     *    Url:
     *     path to IHandler
     */
    register: function (extension, handler) {
        if (typeof handler === 'string') {
            var resource = include;
            if (resource.location == null) {
                resource = {
                    location: (0, path_1.path_getDir)((0, path_1.path_resolveCurrent)())
                };
            }
            handler = (0, path_1.path_resolveUrl)(handler, resource);
        }
        cfg.loader[extension] = handler;
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_CustomLoader === module.exports) {
        // do nothing if
    } else if (__isObj(_src_CustomLoader) && __isObj(module.exports)) {
        Object.assign(_src_CustomLoader, module.exports);
    } else {
        _src_CustomLoader = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_modules_common;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_modules_common != null ? _src_modules_common : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonJS = void 0;
var global_1 = _src_global;
var Config_1 = _src_Config;
exports.CommonJS = {
    exports: null,
    require: function commonjs(path) {
        var _a;
        if (path.charCodeAt(0) !== 46) {
            // .
            if ((_a = global_1.global.module) === null || _a === void 0 ? void 0 : _a.require) {
                var moduleBefore = global_1.global.module;
                var result = global_1.global.module.require(path);
                if (moduleBefore !== global_1.global.module) {
                    global_1.global.module = moduleBefore;
                }
                return result;
            }
            if (global_1.__require.nativeRequire != null) {
                return global_1.__require.nativeRequire(path);
            }
        }
        var currentSync = Config_1.cfg.sync;
        var currentEval = Config_1.cfg.eval;
        var currentInclude = include;
        var currentModuleDescriptor = Object.getOwnPropertyDescriptor(global_1.global, 'module');
        var exports = null;
        Config_1.cfg.sync = true;
        Config_1.cfg.eval = true;
        include.instance(include.url, include).js(path + '::Module').done(function (resp) {
            exports = resp.Module;
        });
        include = currentInclude;
        Object.defineProperty(global_1.global, 'module', currentModuleDescriptor);
        Config_1.cfg.sync = currentSync;
        Config_1.cfg.eval = currentEval;
        return exports;
    },
    enable: function () {
        enableExports();
        enableRequire();
    }
};
function enableRequire() {
    global_1.global.require = exports.CommonJS.require;
}
function enableExports() {
    if (global_1.global.module != null) {
        return;
    }
    if (typeof Object.defineProperty === 'undefined') {
        console.warn('Browser do not support Object.defineProperty');
        return;
    }
    Object.defineProperty(global_1.global, 'module', {
        get: function () {
            return global_1.global.include;
        },
        configurable: true
    });
    var globalExports = null;
    Object.defineProperty(global_1.global, 'exports', {
        get: function () {
            var _a;
            var current = global_1.global.include;
            if (current == null) {
                return globalExports;
            }
            return (_a = current.exports) !== null && _a !== void 0 ? _a : (current.exports = {});
        },
        set: function (exports) {
            globalExports = exports;
            if (global_1.global.include) {
                global_1.global.include.exports = exports;
            }
        },
        configurable: true
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_modules_common === module.exports) {
        // do nothing if
    } else if (__isObj(_src_modules_common) && __isObj(module.exports)) {
        Object.assign(_src_modules_common, module.exports);
    } else {
        _src_modules_common = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_modules_amd;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_modules_amd != null ? _src_modules_amd : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Amd = void 0;
var Bin_1 = _src_Bin;
var common_1 = _src_modules_common;
var global_1 = _src_global;
var Resource_1 = _src_Resource;
exports.Amd = {
    enable: function () {
        enable();
    },
};
function enable() {
    var define = (global_1.global.define = function (a, b, c) {
        var i = arguments.length;
        var args = new Array(i);
        while (--i > -1) {
            args[i] = arguments[i];
        }
        var fn = getFn(patterns, args);
        var module = global_1.global.include;
        fn(module, a, b, c);
    });
    if (global_1.isBrowser) {
        define.amd = true;
    }
    var __includeRequire = (global_1.global.require = global_1.__require.includeRequire = function amd() {
        if (global_1.isNode && global_1.__require.nativeRequire && arguments.length === 1) {
            return global_1.__require.nativeRequire.apply(null, arguments);
        }
        return define.apply(null, arguments);
    });
    if (typeof require !== 'undefined') {
        require = __includeRequire;
    }
}
var patterns = [
    [
        [isExports],
        function (module, exports) {
            _define(module, null, null, exports);
        },
    ],
    [
        [isString, isExports],
        function (module, name, exports) {
            _define(module, name, null, exports);
        },
    ],
    [
        [isString, isArray, isExports],
        function (module, name, dependencies, exports) {
            _define(module, name, dependencies, exports);
        },
    ],
    [
        [isArray, isExports],
        function (module, dependencies, exports) {
            _define(module, null, dependencies, exports);
        },
    ],
];
function getFn(patterns, args) {
    var i = -1, imax = patterns.length;
    outer: while (++i < imax) {
        var pattern = patterns[i][0];
        if (pattern.length !== args.length) {
            continue;
        }
        var j = -1, jmax = pattern.length;
        while (++j < jmax) {
            var matcher = pattern[j];
            if (matcher(args[j]) === false) {
                continue outer;
            }
        }
        return patterns[i][1];
    }
    console.warn('Define function arguments are invalid', args);
    return emptyFn;
}
function emptyFn() { }
function _define(module, name, dependencies, exports) {
    if (name != null) {
        Bin_1.bin.js[name] = module;
    }
    if (dependencies == null) {
        module.exports = getExports(exports) || module.exports;
        return;
    }
    var deps = getDepsInfo(dependencies, module);
    var arr = deps.array;
    var linked = deps.linked;
    if (linked.length === 0) {
        module.exports = getExports(exports, arr) || module.exports;
        return;
    }
    if (module.require == null) {
        module = new Resource_1.Resource();
    }
    module.require(deps.linked).done(function (resp) {
        readResp(arr, resp);
        module.exports = getExports(exports, arr) || module.exports;
    });
}
function getExports(mix, args) {
    if (args === void 0) { args = []; }
    if (typeof mix === 'function') {
        return mix.apply(null, args);
    }
    return mix;
}
function getDepsInfo(deps, module) {
    var array = new Array(deps.length), linked = [], imax = deps.length, i = -1;
    while (++i < imax) {
        var fn = StaticResolvers[deps[i]];
        if (fn == null) {
            linked.push(deps[i] + '::' + i);
            continue;
        }
        array[i] = fn(module);
    }
    return { array: array, linked: linked };
}
var StaticResolvers = {
    module: function (module) {
        return module;
    },
    exports: function (module) {
        return module.exports || (module.exports = {});
    },
    require: function (module) {
        return common_1.CommonJS.require;
    },
};
function isString(x) {
    return typeof x === 'string';
}
function isExports(x) {
    return true;
}
function isArray(x) {
    return x instanceof Array;
}
function enableExports() {
    if (typeof Object.defineProperty === 'undefined') {
        console.warn('Browser do not support Object.defineProperty');
        return;
    }
    Object.defineProperty(global_1.global, 'module', {
        get: function () {
            return global_1.global.include;
        },
    });
    Object.defineProperty(global_1.global, 'exports', {
        get: function () {
            var current = global_1.global.include;
            return current.exports || (current.exports = {});
        },
        set: function (exports) {
            global_1.global.include.exports = exports;
        },
    });
}
function readResp(arr, resp) {
    var digit = /^\d+$/;
    for (var key in resp) {
        var val = resp[key];
        if (val == null) {
            continue;
        }
        if (key === 'load' || key === 'ajax') {
            readResp(arr, val);
            continue;
        }
        arr[+key] = val;
    }
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_modules_amd === module.exports) {
        // do nothing if
    } else if (__isObj(_src_modules_amd) && __isObj(module.exports)) {
        Object.assign(_src_modules_amd, module.exports);
    } else {
        _src_modules_amd = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_loader_load;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_loader_load != null ? _src_loader_load : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBundleParser = void 0;
var global_1 = _src_global;
exports.LoadBundleParser = {
    process: function (source, res) {
        var div = document.createElement('div');
        div.innerHTML = source;
        global_1.loadBags.push(div);
        return source;
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_loader_load === module.exports) {
        // do nothing if
    } else if (__isObj(_src_loader_load) && __isObj(module.exports)) {
        Object.assign(_src_loader_load, module.exports);
    } else {
        _src_loader_load = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_loader_mask;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_loader_mask != null ? _src_loader_mask : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaskLoader = void 0;
var global_1 = _src_global;
exports.MaskLoader = {
    supports: function (resource) {
        return resource.type === 'mask';
    },
    process: function (response, resource, onComplete) {
        var mask = global_1.global.mask;
        if (mask == null) {
            mask = global_1.global.require('maskjs');
        }
        mask
            .Module
            .registerModule(response, { path: resource.url })
            .done(function (module) {
            onComplete(module.exports);
        })
            .fail(function (error) {
            console.error(error);
            onComplete(null);
        });
    }
};
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_loader_mask === module.exports) {
        // do nothing if
    } else if (__isObj(_src_loader_mask) && __isObj(module.exports)) {
        Object.assign(_src_loader_mask, module.exports);
    } else {
        _src_loader_mask = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Config;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Config != null ? _src_Config : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cfg = exports.Config = void 0;
var global_1 = _src_global;
var CustomLoader_1 = _src_CustomLoader;
var PathResolver_1 = _src_PathResolver;
var common_1 = _src_modules_common;
var amd_1 = _src_modules_amd;
var load_1 = _src_loader_load;
var mask_1 = _src_loader_mask;
var Routing_1 = _src_Routing;
/**
 *    path = root path. @default current working path, im browser window.location;
 *    eval = in node.js this conf. is forced
 *    lockedToFolder = makes current url as root path
 *        Example "/script/main.js" within this window.location "{domain}/apps/1.html"
 *        will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
*/
var isFileProtocol = global_1.document && global_1.document.location && global_1.document.location.protocol === 'file:';
var Config = /** @class */ (function () {
    function Config() {
        this.path = '';
        this.base = null;
        this.loader = {
            'load': load_1.LoadBundleParser,
            'mask': mask_1.MaskLoader,
        };
        this.version = null;
        this.lockedToFolder = isFileProtocol;
        this.sync = false;
        this.eval = global_1.document == null;
        this.es6Exports = false;
        this.server = false;
        this.logCyclic = false;
        this.workerSuffix = 'worker';
        this.autoreload = null;
        this.lazy = null;
    }
    Config.prototype.call = function (ctx, a, b) {
        if (a == null) {
            return this;
        }
        var aType = typeof a;
        var bType = typeof b;
        if (aType === 'string' && b == null) {
            return this[a];
        }
        if (aType === 'string' && b != null) {
            set(this, a, b);
            return ctx;
        }
        if (aType === 'object' && b == null) {
            for (var key in a) {
                set(this, key, a[key]);
            }
        }
        return ctx;
    };
    return Config;
}());
exports.Config = Config;
;
function set(cfg, key, value) {
    switch (key) {
        case 'loader':
            for (var x in value) {
                CustomLoader_1.CustomLoader.register(x, value[x]);
            }
            return;
        case 'modules':
            if (value === true)
                enableModules();
            return;
        case 'commonjs':
            if (value === true)
                common_1.CommonJS.enable();
            return;
        case 'amd':
            if (value === true)
                amd_1.Amd.enable();
            return;
        case 'map':
            PathResolver_1.PathResolver.configMap(value);
            return;
        case 'rewrite':
            PathResolver_1.PathResolver.configRewrites(value);
            return;
        case 'npm':
            PathResolver_1.PathResolver.configNpm(value);
            return;
        case 'extensionDefault':
        // typo: but back comp it
        case 'extentionDefault':
        case 'extensionDefault':
            PathResolver_1.PathResolver.configExt({ def: value });
            return;
        case 'extentionTypes':
        case 'extensionTypes':
            PathResolver_1.PathResolver.configExt({ types: value });
            return;
        case 'routes':
            for (var pfx in value) {
                Routing_1.Routes.register(pfx, value[pfx]);
            }
            return;
    }
    if ((key in cfg) === false) {
        console.warn('Not supported config', key);
    }
    cfg[key] = value;
}
function enableModules() {
    if (typeof Object.defineProperty === 'undefined') {
        console.warn('Browser do not support Object.defineProperty');
        return;
    }
    Object.defineProperty(global, 'module', {
        get: function () {
            return global.include;
        }
    });
    Object.defineProperty(global, 'exports', {
        get: function () {
            var current = global.include;
            return (current.exports || (current.exports = {}));
        },
        set: function (exports) {
            global.include.exports = exports;
        }
    });
}
var cfg = new Config;
exports.cfg = cfg;
(0, CustomLoader_1.inject)(cfg);
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Config === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Config) && __isObj(module.exports)) {
        Object.assign(_src_Config, module.exports);
    } else {
        _src_Config = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_utils_file;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_utils_file != null ? _src_node_utils_file : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fs_exists = exports.file_watch = exports.file_read = void 0;
var Config_1 = _src_Config;
var _fs = require("fs");
var path_1 = _src_utils_path;
var _watchers = {};
function file_read(url, callback) {
    if (global.io && global.io.File) {
        readWithAtmaIo(global.io.File, url, callback);
        return;
    }
    url = toSystemPath(url);
    if (Config_1.cfg.sync) {
        try {
            var content = _fs.readFileSync(url, 'utf8');
            callback(null, content);
        }
        catch (error) {
            console.error('File Read - ', error);
        }
        return;
    }
    _fs.readFile(url, 'utf8', callback);
}
exports.file_read = file_read;
;
function readWithAtmaIo(File, url, callback) {
    if (Config_1.cfg.sync) {
        var content = File.read(url);
        if (!content) {
            console.error("File read error ".concat(url));
        }
        callback(null, content);
        return;
    }
    File.readAsync(url).then(function (content) { return callback(null, content); }, callback);
}
function file_watch(url, callback) {
    url = toSystemPath(url);
    _unbind(url);
    try {
        _watchers[url] = _fs.watch(url, callback);
    }
    catch (error) {
        console.warn("Tried to watch the file ".concat(url, ": ").concat(error.message));
    }
}
exports.file_watch = file_watch;
;
function fs_exists(path) {
    return _fs.existsSync(path);
}
exports.fs_exists = fs_exists;
;
function _unbind(path) {
    if (_watchers[path] == null)
        return;
    _watchers[path].close();
    _watchers[path] = null;
}
function toSystemPath(url) {
    if (url.indexOf('file://') !== -1) {
        return (0, path_1.path_getFile)(url);
    }
    if (url[0] === '/') {
        return url.substring(1);
    }
    return url;
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_utils_file === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_utils_file) && __isObj(module.exports)) {
        Object.assign(_src_node_utils_file, module.exports);
    } else {
        _src_node_utils_file = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_PatchXhr;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_PatchXhr != null ? _src_node_PatchXhr : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = _src_global;
var file_1 = _src_node_utils_file;
var Config_1 = _src_Config;
var Bin_1 = _src_Bin;
global_1.refs.XMLHttpRequest = /** @class */ (function () {
    function NodeXMLHttpRequest() {
        this.headers = {};
    }
    NodeXMLHttpRequest.prototype.open = function (method, url) {
        this.url = url;
    };
    NodeXMLHttpRequest.prototype.on = function (event, cb) {
        if (event === 'error') {
            this.onerror = cb;
            return;
        }
        console.warn('Not implemented event', event);
    };
    NodeXMLHttpRequest.prototype.send = function () {
        var _this = this;
        var q = this.url.indexOf('?');
        if (q !== -1) {
            this.url = this.url.substring(0, q);
        }
        (0, file_1.file_read)(this.url, function (err, data) {
            var _a;
            if (err) {
                _this.status = 500;
                (_a = _this.onerror) === null || _a === void 0 ? void 0 : _a.call(_this, err);
                data = '';
            }
            else {
                _this.status = 200;
            }
            _this.readyState = 4;
            _this.responseText = data;
            _this.onreadystatechange();
            if (err == null && Config_1.cfg.autoreload) {
                (0, file_1.file_watch)(_this.url, (0, Bin_1.bin_removeDelegate)(_this.url));
            }
        });
    };
    NodeXMLHttpRequest.prototype.addEventListener = function (event, cb) {
        this.on(event, cb);
    };
    NodeXMLHttpRequest.prototype.getAllResponseHeaders = function () {
        return this.headers;
    };
    return NodeXMLHttpRequest;
}());
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_PatchXhr === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_PatchXhr) && __isObj(module.exports)) {
        Object.assign(_src_node_PatchXhr, module.exports);
    } else {
        _src_node_PatchXhr = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_eval;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_eval != null ? _src_node_eval : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalEval = void 0;
var path_1 = _src_utils_path;
var global_1 = _src_global;
var Module = require("module");
var vm = require("vm");
if (typeof CURRENT_MODULE === 'undefined') {
    global_1.global.CURRENT_MODULE = global_1.include;
}
var currentModule = CURRENT_MODULE;
function internalEval(source, include, isGlobalCtx) {
    var _a;
    if (isGlobalCtx === void 0) { isGlobalCtx = false; }
    var module = currentModule;
    global_1.global.include = include;
    global_1.global.require = global_1.global.require;
    global_1.global.exports = module.exports;
    //- path_getFile(include.url);//
    var f = (0, path_1.path_toLocalFile)((_a = include.id) !== null && _a !== void 0 ? _a : include.url);
    global_1.global.__filename = f;
    global_1.global.__dirname = (0, path_1.path_getDir)(f);
    global_1.global.module = module;
    if (isGlobalCtx !== true) {
        source = '(function(){ ' + source + '\n}())';
    }
    try {
        if (!isGlobalCtx) {
            var filename = global_1.global.__filename;
            module = currentModule = new Module(filename, module);
            module.paths = Module._nodeModulePaths((0, path_1.path_getDir)(filename));
            module.filename = filename;
            global_1.global.module = module;
            module._compile(source, filename);
            module.loaded = true;
            global_1.global.module = currentModule;
        }
        else {
            module.exports = {};
            vm.runInThisContext(source, global_1.global.__filename);
        }
    }
    catch (e) {
        console.error('Module Evaluation Error', include.url);
        console.error(e.stack);
    }
    if (isEmpty(include.exports)) {
        var exports = module.exports;
        if (typeof exports !== 'object' || isEmpty(exports) === false) {
            include.exports = module.exports;
        }
    }
}
exports.internalEval = internalEval;
;
function isEmpty(exports) {
    for (var key in exports) {
        if (key in Object.prototype === false) {
            return false;
        }
    }
    return true;
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_eval === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_eval) && __isObj(module.exports)) {
        Object.assign(_src_node_eval, module.exports);
    } else {
        _src_node_eval = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_PatchEval;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_PatchEval != null ? _src_node_PatchEval : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eval_1 = _src_node_eval;
var global_1 = _src_global;
global_1.refs.evaluate = eval_1.internalEval;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_PatchEval === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_PatchEval) && __isObj(module.exports)) {
        Object.assign(_src_node_PatchEval, module.exports);
    } else {
        _src_node_PatchEval = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_PatchResource;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_PatchResource != null ? _src_node_PatchResource : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = _src_Resource;
var path_1 = _src_utils_path;
var State_1 = _src_models_State;
var Type_1 = _src_models_Type;
var array_1 = _src_utils_array;
var global_1 = _src_global;
var file_1 = _src_node_utils_file;
var Include_1 = _src_Include;
var Bin_1 = _src_Bin;
var Module = require("module");
var npmPath;
var atmaPath;
var moduleRoot;
Resource_1.Resource.prototype.path_getFile = function () {
    return (0, path_1.path_getFile)(this.url);
};
Resource_1.Resource.prototype.path_getDir = function () {
    return (0, path_1.path_getDir)((0, path_1.path_getFile)(this.url));
};
Resource_1.Resource.prototype.inject = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var pckg = args.length === 1 ?
        args[0] :
        args;
    this.state = this.state >= State_1.State.Evaluated ? State_1.State.Evaluated : State_1.State.Evaluating;
    var current = this, bundle = current.create(Type_1.ResourceType.Js).resource;
    bundle.url = this.url;
    bundle.location = this.location;
    bundle
        .load(pckg)
        .done(function (resp) {
        bundle.state = 3;
        bundle.on(4, function () {
            var remove = 1;
            var index = (0, array_1.arr_indexOf)(current.includes, function (res) {
                return res.resource === bundle;
            });
            if (index === -1) {
                index = current.includes.length - 1;
                remove = 0;
            }
            current
                .includes
                .splice
                .apply(current.includes, [index, remove].concat(bundle.includes));
            current.readystatechanged(3);
        });
        inject_process(bundle, 0);
    });
    return current;
};
Resource_1.Resource.prototype.embed = function () {
    return this.js.apply(this, arguments);
};
Resource_1.Resource.prototype.instance = function (currentUrl, parent) {
    if (typeof currentUrl === 'string') {
        moduleRoot !== null && moduleRoot !== void 0 ? moduleRoot : (moduleRoot = global_1.global.module);
        var path = currentUrl === '' || currentUrl === '/'
            ? moduleRoot.id
            : currentUrl;
        if (path[0] === '/') {
            path = (0, path_1.path_combine)((0, path_1.path_resolveBase)(), path);
        }
        var next = new Module(path, moduleRoot);
        next.filename = (0, path_1.path_getFile)(path);
        next.paths = Module._nodeModulePaths((0, path_1.path_getDir)(next.filename));
        if (npmPath == null) {
            var PATH = process.env.PATH || process.env.path, delimiter = require('path').delimiter, parts = PATH.split(delimiter);
            var i = parts.length, rgx = /([\\\/]npm[\\\/])|([\\\/]npm$)/gi;
            while (--i > -1) {
                if (rgx.test(parts[i])) {
                    npmPath = parts[i];
                    break;
                }
            }
            if (npmPath == null && process.platform !== 'win32') {
                [
                    '/usr/lib/node_modules',
                    '/usr/local/lib/node_modules'
                ].forEach(function (path) {
                    if (npmPath == null && (0, file_1.fs_exists)(path))
                        npmPath = path;
                });
            }
            if (npmPath) {
                if (npmPath.indexOf('node_modules') === -1)
                    npmPath = (0, path_1.path_combine)(npmPath, 'node_modules');
                atmaPath = (0, path_1.path_combine)((0, path_1.path_getDir)((0, path_1.path_normalize)(process.mainModule.filename)), 'node_modules');
            }
            else {
                npmPath = false;
                console.warn('Could not resolve global NPM Directory from system path (%s)', delimiter, PATH);
            }
        }
        if (atmaPath) {
            next.paths.push(atmaPath);
        }
        if (npmPath) {
            next.paths.push(npmPath);
        }
        global_1.global.module = module = next;
        var req = next.require.bind(next);
        if (global_1.__require.includeRequire == null) {
            global_1.global.require = require = req;
        }
        else {
            global_1.__require.nativeRequire = req;
        }
    }
    var resource;
    if (currentUrl == null) {
        resource = new Include_1.Include();
        resource.state = 4;
        return resource;
    }
    resource = new Resource_1.Resource('js');
    resource.state = 4;
    resource.url = (0, path_1.path_resolveUrl)(currentUrl, parent);
    resource.location = (0, path_1.path_getDir)(resource.url);
    resource.parent = parent;
    return resource;
};
function inject_process(bundle, index) {
    if (index >= bundle.includes.length) {
        bundle.readystatechanged(4);
        return;
    }
    var include = bundle.includes[index];
    var resource = include.resource;
    var alias = include.route.alias;
    var source = resource.source || resource.exports;
    if (resource.state === 4) {
        if (resource.exports && alias) {
            global_1.global[alias] = resource.exports;
        }
        inject_process(bundle, ++index);
        return;
    }
    resource.exports = null;
    resource.type = 'js';
    resource.includes = null;
    resource.state = 3;
    resource.parent = null;
    for (var key in Bin_1.bin.load) {
        if (Bin_1.bin.load[key] === resource) {
            delete Bin_1.bin.load[key];
            break;
        }
    }
    try {
        global_1.refs.evaluate(source, resource, true);
    }
    catch (error) {
        console.error('<inject> Evaluation error', resource.url, error);
        resource.state = 4;
    }
    resource.readystatechanged(3);
    resource.on(4, function () {
        if (resource.exports && alias) {
            global_1.global[alias] = resource.exports;
        }
        inject_process(bundle, ++index);
    });
}
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_PatchResource === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_PatchResource) && __isObj(module.exports)) {
        Object.assign(_src_node_PatchResource, module.exports);
    } else {
        _src_node_PatchResource = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_node_export;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_node_export != null ? _src_node_export : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = _src_Config;
_src_node_PatchXhr;
_src_node_PatchEval;
_src_node_PatchResource;
Config_1.cfg.server = true;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_node_export === module.exports) {
        // do nothing if
    } else if (__isObj(_src_node_export) && __isObj(module.exports)) {
        Object.assign(_src_node_export, module.exports);
    } else {
        _src_node_export = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js

"use strict";
_src_global;
//#if (NODE)
_src_node_export;
//#endif
var Routing_1 = _src_Routing;
var Resource_1 = _src_Resource;
var ScriptStack_1 = _src_ScriptStack;
var PathResolver_1 = _src_PathResolver;
var CustomLoader_1 = _src_CustomLoader;
var Include_1 = _src_Include;
var Config_1 = _src_Config;
var IncludeLib = {
    Routes: Routing_1.RoutesLib,
    Resource: Resource_1.Resource,
    ScriptStack: ScriptStack_1.ScriptStack,
    PathResolver: PathResolver_1.PathResolver,
    Config: Config_1.Config,
    registerLoader: CustomLoader_1.CustomLoader.register,
    instance: Include_1.Include.instance
};
module.exports = {
    include: new Include_1.Include,
    includeLib: IncludeLib
};


}));

// end:source ./umd/umd-module.js
