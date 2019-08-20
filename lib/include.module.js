// source ./umd/umd.js
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
var _src_loader_json = {};
var _src_loader_load = {};
var _src_loader_mask = {};
var _src_models_State = {};
var _src_models_Type = {};
var _src_modules_amd = {};
var _src_modules_common = {};
var _src_utils_array = {};
var _src_utils_fn = {};
var _src_utils_object = {};
var _src_utils_path = {};
var _src_utils_res = {};
var _src_utils_tree = {};

// source ./ModuleSimplified.js
var _src_global;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _global = typeof global === 'undefined' ? null : global;
exports.global = _global;
var _module = typeof module === 'undefined' ? null : module;
exports.module = _module;
var _document = typeof document === 'undefined' ? null : document;
exports.document = _document;
var _require = typeof require === 'undefined' ? null : require;
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
//#if (BROWSER)
_isBrowser = true;
_isNode = false;
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_global) && isObject(module.exports)) {
		Object.assign(_src_global, module.exports);
		return;
	}
	_src_global = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_models_Type;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_models_Type) && isObject(module.exports)) {
		Object.assign(_src_models_Type, module.exports);
		return;
	}
	_src_models_Type = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_array;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_array) && isObject(module.exports)) {
		Object.assign(_src_utils_array, module.exports);
		return;
	}
	_src_utils_array = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_fn;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_fn) && isObject(module.exports)) {
		Object.assign(_src_utils_fn, module.exports);
		return;
	}
	_src_utils_fn = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Events;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = _src_utils_array;
var fn_1 = _src_utils_fn;
var readycollection = [];
var supports = typeof document !== 'undefined' && typeof window !== 'undefined';
function onReady() {
    exports.Events.ready = fn_1.fn_doNothing;
    if (readycollection.length === 0) {
        return;
    }
    array_1.arr_invoke(readycollection);
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Events) && isObject(module.exports)) {
		Object.assign(_src_Events, module.exports);
		return;
	}
	_src_Events = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_object;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_object) && isObject(module.exports)) {
		Object.assign(_src_utils_object, module.exports);
		return;
	}
	_src_utils_object = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_tree;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            obj = object_1.obj_getProperty(obj, path);
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_tree) && isObject(module.exports)) {
		Object.assign(_src_utils_tree, module.exports);
		return;
	}
	_src_utils_tree = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_models_State;
(function () {
	var exports = {};
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_models_State) && isObject(module.exports)) {
		Object.assign(_src_models_State, module.exports);
		return;
	}
	_src_models_State = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_IncludeDeferred;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Events_1 = _src_Events;
var Routing_1 = _src_Routing;
var Config_1 = _src_Config;
var global_1 = _src_global;
var tree_1 = _src_utils_tree;
var State_1 = _src_models_State;
var Type_1 = _src_models_Type;
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
    IncludeDeferred.prototype.resolve = function (callback) {
        var _this = this;
        var includes = this.includes, length = includes == null
            ? 0
            : includes.length;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                var x = includes[i];
                var resource = x.resource;
                var route = x.route;
                var type = resource.type;
                switch (type) {
                    case 'js':
                    case 'load':
                    case 'ajax':
                    case 'mask':
                        var alias = route.alias || Routing_1.Routes.parseAlias(route), obj = type === 'js'
                            ? (this.response)
                            : (this.response[type] || (this.response[type] = {}));
                        if (alias != null) {
                            var exp = resource.exports;
                            if (Config_1.cfg.es6Exports && (exp != null && typeof exp === 'object')) {
                                exp = exp.default || exp;
                            }
                            obj[alias] = exp;
                            break;
                        }
                        console.warn('<includejs> Alias is undefined', resource);
                        break;
                }
            }
        }
        var response = this.response || global_1.emptyResponse;
        if (this._use == null && this._usage != null) {
            this._use = tree_1.tree_resolveUsage(this, this._usage, function () {
                _this.state = State_1.State.AllCompleted;
                _this.resolve(callback);
                _this.readystatechanged(State_1.State.AllCompleted);
            });
            if (this.state < State_1.State.AllCompleted)
                return;
        }
        if (this._use) {
            callback.apply(null, [response].concat(this._use));
            return;
        }
        var before = null;
        if (this.type === Type_1.ResourceType.Js) {
            before = global.include;
            global.include = this;
        }
        callback(response);
        if (before != null && global.include === this) {
            global.include = before;
        }
    };
    return IncludeDeferred;
}());
exports.IncludeDeferred = IncludeDeferred;
;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_IncludeDeferred) && isObject(module.exports)) {
		Object.assign(_src_IncludeDeferred, module.exports);
		return;
	}
	_src_IncludeDeferred = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Bin;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (timeout)
            clearTimeout(timeout);
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
    if (parents.length === 0) {
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
    var id = path_1.path_normalize(url);
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
    if (url == null) {
        return null;
    }
    url = normalize(url);
    var bin = bins[type];
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
        handled.push(x.resource.url);
        clearParents(bins, x.resource, roots, handled);
    });
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Bin) && isObject(module.exports)) {
		Object.assign(_src_Bin, module.exports);
		return;
	}
	_src_Bin = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Helper;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = _src_Config;
var global_1 = _src_global;
exports.Helper = {
    reportError: function (e) {
        console.error('IncludeJS Error:', e, e.message, e.url);
        global_1.handler.onerror && global_1.handler.onerror(e);
    },
    XHR: function (resource, callback) {
        var xhr = new global_1.refs.XMLHttpRequest();
        xhr.onreadystatechange = function () {
            xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
        };
        var url = typeof resource === 'object' ? resource.url : resource;
        var async = Config_1.cfg.sync === true ? false : true;
        if (global_1.isBrowser && Config_1.cfg.version) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Config_1.cfg.version;
        }
        if (url[0] === '/' && Config_1.cfg.lockedToFolder === true) {
            url = url.substring(1);
        }
        xhr.open('GET', url, async);
        xhr.send();
    },
    XHR_LOAD: function (url, callback) {
        var xhr = new global_1.refs.XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                callback(xhr.status);
                return;
            }
            callback(null, xhr.responseText);
        };
        xhr.open('GET', url, Config_1.cfg.sync === true ? false : true);
        xhr.send();
    }
};
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Helper) && isObject(module.exports)) {
		Object.assign(_src_Helper, module.exports);
		return;
	}
	_src_Helper = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_ScriptStack;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = _src_Config;
var Helper_1 = _src_Helper;
var global_1 = _src_global;
/** @TODO Refactor loadBy* {combine logic} */
var head, currentResource, stack = [], _cb_complete = [], _paused;
function loadScript(url, callback) {
    if (Config_1.cfg.version) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + Config_1.cfg.version;
    }
    if (url[0] === '/' && Config_1.cfg.lockedToFolder === true) {
        url = url.substring(1);
    }
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    tag.src = url;
    if ('onreadystatechange' in tag) {
        tag.onreadystatechange = function () {
            (this.readyState === 'complete' || this.readyState === 'loaded') && callback();
        };
    }
    else {
        tag.onload = tag.onerror = callback;
    }
    if (head == null) {
        head = document.getElementsByTagName('head')[0];
    }
    head.appendChild(tag);
}
function loadByEmbedding() {
    if (_paused) {
        return;
    }
    if (stack.length === 0) {
        trigger_complete();
        return;
    }
    if (currentResource != null) {
        return;
    }
    var resource = (currentResource = stack[0]);
    if (resource.state === 1) {
        return;
    }
    resource.state = 1;
    global.include = resource;
    function resourceLoaded(e) {
        if (e === void 0) { e = null; }
        if (e && e.type === 'error') {
            console.log('Script Loaded Error', resource.url);
        }
        var i = 0, length = stack.length;
        for (; i < length; i++) {
            if (stack[i] === resource) {
                stack.splice(i, 1);
                break;
            }
        }
        if (i === length) {
            console.error('Loaded Resource not found in stack', resource);
            return;
        }
        if (resource.state !== 2.5)
            resource.readystatechanged(3);
        currentResource = null;
        loadByEmbedding();
    }
    if (resource.source) {
        global_1.refs.evaluate(resource.source, resource);
        resourceLoaded();
        return;
    }
    loadScript(resource.url, resourceLoaded);
}
function processByEval() {
    if (_paused) {
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
    if (resource.state < 2) {
        return;
    }
    currentResource = resource;
    currentResource.state = 1;
    global.include = resource;
    global_1.refs.evaluate(resource.source, resource);
    stackRemove(resource);
    if (resource.state !== 2.5) {
        resource.readystatechanged(3);
    }
    currentResource = null;
    processByEval();
}
function processByEvalSync() {
    if (_paused) {
        return;
    }
    if (stack.length === 0) {
        trigger_complete();
        return;
    }
    var resource = stack.shift();
    if (resource.state < 2) {
        return;
    }
    currentResource = resource;
    currentResource.state = 3;
    global.include = resource;
    global_1.refs.evaluate(resource.source, resource);
    resource.readystatechanged(3);
    currentResource = null;
    processByEvalSync();
}
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
    var i = -1, imax = _cb_complete.length;
    while (++i < imax) {
        _cb_complete[i]();
    }
    _cb_complete.length = 0;
}
exports.ScriptStack = {
    load: function (resource, parent, forceEmbed) {
        this.add(resource, parent);
        if (!Config_1.cfg.eval || forceEmbed) {
            loadByEmbedding();
            return;
        }
        // was already loaded, with custom loader for example
        if (resource.source) {
            resource.state = 2;
            processByEval();
            return;
        }
        Helper_1.Helper.XHR(resource, function (resource, response) {
            if (!response) {
                console.error('Not Loaded:', resource.url);
                console.error('- Initiator:', resource.parent && resource.parent.url || '<root resource>');
            }
            resource.source = response;
            resource.state = 2;
            if (Config_1.cfg.sync) {
                processByEvalSync();
                return;
            }
            processByEval();
        });
    },
    add: function (resource, parent) {
        if (resource.priority === 1)
            return stack.unshift(resource);
        if (parent == null)
            return stack.push(resource);
        var imax = stack.length, i = -1;
        // move close to parent
        while (++i < imax) {
            if (stack[i] === parent)
                return stack.splice(i, 0, resource);
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
        _paused = true;
    },
    resume: function () {
        _paused = false;
        if (currentResource != null)
            return;
        this.touch();
    },
    touch: function () {
        var fn = Config_1.cfg.eval
            ? processByEval
            : loadByEmbedding;
        fn();
    },
    complete: function (callback) {
        if (_paused !== true && stack.length === 0) {
            callback();
            return;
        }
        _cb_complete.push(callback);
    }
};
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_ScriptStack) && isObject(module.exports)) {
		Object.assign(_src_ScriptStack, module.exports);
		return;
	}
	_src_ScriptStack = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Include;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
            Routing_1.Routes.register(mix, arguments[1], this);
            return this;
        }
        for (var key in mix) {
            Routing_1.Routes.register(key, mix[key], this);
        }
        return this;
    };
    Include.prototype.promise = function (namespace) {
        var arr = namespace.split('.'), obj = global_2.global;
        while (arr.length) {
            var key = arr.shift();
            obj = obj[key] || (obj[key] = {});
        }
        return obj;
    };
    /** @TODO - `id` property seems to be unsed and always equal to `url` */
    Include.prototype.register = function (_bin) {
        var base = this.base, key, info, infos, imax, i;
        function transform(info) {
            if (base == null)
                return info;
            if (info.url[0] === '/')
                info.url = base + info.url.substring(1);
            if (info.parent[0] === '/')
                info.parent = base + info.parent.substring(1);
            info.id = info.url;
            return info;
        }
        for (key in _bin) {
            infos = _bin[key];
            imax = infos.length;
            i = -1;
            while (++i < imax) {
                info = transform(infos[i]);
                var id = info.url, url = info.url, namespace = info.namespace, parent = info.parent && Bin_1.Bin.find(info.parent), resource = new Resource_1.Resource(), state = info.state;
                if (!(id || url))
                    continue;
                if (url) {
                    if (url[0] === '/') {
                        url = url.substring(1);
                    }
                    resource.location = path_1.path_getDir(url);
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
     *	Create new Resource Instance,
     *	as sometimes it is necessary to call include. on new empty context
     */
    Include.prototype.instance = function (url, parent) {
        return Include.instance(url, parent);
    };
    Include.instance = function (url, parent) {
        var resource;
        if (url == null) {
            resource = new Include();
            resource.isRoot = true;
            resource.state = 4;
            return resource;
        }
        resource = new Resource_1.Resource('js');
        resource.state = 4;
        resource.url = path_1.path_resolveUrl(url, parent);
        resource.location = path_1.path_getDir(resource.url);
        resource.parent = parent;
        resource.isRoot = true;
        return resource;
    };
    Include.prototype.noConflict = function () {
        global_2.noConflict();
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
            _res = Bin_1.Bin.get(type, path_1.path_combine(this.base, url));
            if (_res != null)
                return _res;
        }
        if (this.base && this.location) {
            _res = Bin_1.Bin.get(type, path_1.path_combine(this.base, this.location, url));
            if (_res != null)
                return _res;
        }
        if (this.location) {
            _res = Bin_1.Bin.get(null, path_1.path_combine(this.location, url));
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
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).js.apply(_a, args);
    };
    Include.prototype.inject = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).inject.apply(_a, args);
    };
    Include.prototype.css = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).css.apply(_a, args);
    };
    Include.prototype.load = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).load.apply(_a, args);
    };
    Include.prototype.ajax = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).ajax.apply(_a, args);
    };
    Include.prototype.embed = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).embed.apply(_a, args);
    };
    Include.prototype.lazy = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).lazy.apply(_a, args);
    };
    Include.prototype.mask = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a;
        return (_a = new Resource_1.Resource(Type_1.ResourceType.Js)).mask.apply(_a, args);
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Include) && isObject(module.exports)) {
		Object.assign(_src_Include, module.exports);
		return;
	}
	_src_Include = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_PathResolver;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = _src_utils_path;
var Helper_1 = _src_Helper;
var Type_1 = _src_models_Type;
var Routing_1 = _src_Routing;
exports.PathResolver = {
    configMap: function (map) {
        for (var key in map) {
            _map[key] = map;
        }
    },
    configExt: function (config) {
        var def = config.def, types = config.types;
        for (var key in def) {
            _ext[key] = def[key];
        }
        for (var key in types) {
            _extTypes[key] = types[key];
        }
    },
    resolveBasic: function (path_, type, parent) {
        if (type === 'js' && isNodeModuleResolution(path_)) {
            return path_;
        }
        var path = map(path_);
        if (path[0] === '@') {
            var i = path.indexOf('/');
            var namespace = path.substring(0, i);
            var template = path.substring(i + 1);
            var info = Routing_1.Routes.resolve(namespace, template);
            path = info.path;
        }
        path = path_1.path_resolveUrl(path, parent);
        return ensureExtension(path, type);
    },
    isNpm: isNodeModuleResolution,
    getType: getTypeForPath,
    resolveNpm: function (path_, type, parent, cb) {
        var path = map(path_);
        if (path.indexOf('.') > -1) {
            cb(null, path);
            return;
        }
        if (type === 'js') {
            if (isNodeModuleResolution(path)) {
                var parentsPath = parent && parent.location;
                if (!parentsPath || parentsPath === '/') {
                    parentsPath = path_1.path_resolveCurrent();
                }
                nodeModuleResolve(parentsPath, path, cb);
                return;
            }
        }
        if (hasExt(path) === false) {
            path += '.' + _ext[type];
        }
        cb(null, path);
    },
    isNodeNative: function (path) {
        return _nodeBuiltIns.indexOf(path) !== -1;
    }
};
var _map = {};
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
    return _map[path] || path;
}
function hasExt(path) {
    return /\.[\w]{1,8}($|\?|#)/.test(path);
}
function isNodeModuleResolution(path) {
    var isNpm = /^(@?[\w\-]+)(\/[\w\-_]+)*$/.test(path);
    if (isNpm === false) {
        return false;
    }
    if (path[0] !== '@') {
        return true;
    }
    var namespace = path.substring(0, path.indexOf('/'));
    return Routing_1.Routes.routes[namespace] == null;
}
function nodeModuleResolve(current_, path, cb) {
    var name = /^(@?[\w\-]+)/.exec(path)[0];
    var resource = path.substring(name.length + 1);
    if (resource && hasExt(resource) === false) {
        resource += '.js';
    }
    var current = current_.replace(/[^\/]+\.[\w]{1,8}$/, '');
    function check() {
        var nodeModules = current + '/node_modules/' + name + '/';
        var pckg = nodeModules + 'package.json';
        Helper_1.Helper.XHR_LOAD(pckg, function (error, text) {
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
                cb(null, nodeModules + resource);
                return;
            }
            if (json.main) {
                combineMain(nodeModules, json.main, cb);
                return;
            }
            cb(null, path_1.path_combine(nodeModules, 'index.js'));
        });
    }
    check();
}
function ensureExtension(path, type) {
    if (hasExt(path)) {
        return path;
    }
    var ext = _ext[type];
    if (ext == null) {
        console.warn('Extension is not defined for ' + type);
        return path;
    }
    var i = path.indexOf('?');
    if (i === -1)
        return path + '.' + ext;
    return path.substring(0, i) + '.' + ext + path.substring(i);
}
function getTypeForPath(path) {
    var match = /\.([\w]{1,8})($|\?|:)/.exec(path);
    if (match === null) {
        return _extTypes.js;
    }
    var ext = match[1];
    var type = _extTypes[ext];
    return type || Type_1.ResourceType.Load;
}
function combineMain(dir, fileName, cb) {
    var path = path_1.path_combine(dir, fileName);
    if (hasExt(path)) {
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_PathResolver) && isObject(module.exports)) {
		Object.assign(_src_PathResolver, module.exports);
		return;
	}
	_src_PathResolver = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_res;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function append(pckg, type, path) {
    var arr = pckg[type];
    if (arr == null) {
        arr = pckg[type] = [];
    }
    arr.push(path);
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_res) && isObject(module.exports)) {
		Object.assign(_src_utils_res, module.exports);
		return;
	}
	_src_utils_res = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_LazyModule;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_LazyModule) && isObject(module.exports)) {
		Object.assign(_src_LazyModule, module.exports);
		return;
	}
	_src_LazyModule = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Resource;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Include_1 = _src_Include;
var Bin_1 = _src_Bin;
var path_1 = _src_utils_path;
var PathResolver_1 = _src_PathResolver;
var ScriptStack_1 = _src_ScriptStack;
var global_1 = _src_global;
var res_1 = _src_utils_res;
var Routing_1 = _src_Routing;
var CustomLoader_1 = _src_CustomLoader;
var Helper_1 = _src_Helper;
var LazyModule_1 = _src_LazyModule;
var Type_1 = _src_models_Type;
var Config_1 = _src_Config;
var Resource = /** @class */ (function (_super) {
    __extends(Resource, _super);
    function Resource(type, route, namespace, xpath, parent, id, priority) {
        if (type === void 0) { type = null; }
        if (route === void 0) { route = null; }
        if (namespace === void 0) { namespace = null; }
        if (xpath === void 0) { xpath = null; }
        if (parent === void 0) { parent = null; }
        if (id === void 0) { id = null; }
        if (priority === void 0) { priority = null; }
        var _this = _super.call(this) || this;
        var url = route && route.path;
        if (url != null) {
            url = path_1.path_normalize(url);
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
        if (type == null) {
            _this.state = 3;
            return _this;
        }
        if (url == null) {
            _this.state = 3;
            _this.url = path_1.path_resolveCurrent();
            _this.location = path_1.path_getDir(_this.url);
            return _this;
        }
        _this.state = 0;
        _this.location = path_1.path_getDir(url);
        Bin_1.Bin.add(type, id, _this);
        if (isOfOtherType) {
            onXHRCompleted(_this, resource.exports);
        }
        var isNpm = PathResolver_1.PathResolver.isNpm(_this.url);
        if (isNpm && global_1.isNode) {
            _this.exports = global_1.__require.nativeRequire(_this.url);
            _this.readystatechanged(4);
            return _this;
        }
        if (isNpm === false) {
            process(_this);
            return _this;
        }
        PathResolver_1.PathResolver.resolveNpm(_this.url, _this.type, _this.parent, function (error, url) {
            if (error) {
                _this.readystatechanged(4);
                return;
            }
            _this.url = url;
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
    Resource.prototype.create = function (type, route, namespace, xpath, id) {
        if (route === void 0) { route = null; }
        if (namespace === void 0) { namespace = null; }
        if (xpath === void 0) { xpath = null; }
        if (id === void 0) { id = null; }
        this.state = this.state >= 3
            ? 3
            : 2;
        if (this.includes == null) {
            this.includes = [];
        }
        var resource = new Resource(type, route, namespace, xpath, this, id);
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
    Resource.prototype.include = function (type, pckg) {
        var _this = this;
        var children = [], child;
        Routing_1.Routes.each(type, pckg, function (namespace, route, xpath) {
            if (_this.route != null && _this.route.path === route.path) {
                // loading itself
                return;
            }
            child = _this.create(type, route, namespace, xpath);
            children.push(child);
        });
        var i = -1, imax = children.length;
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
    Resource.prototype.require = function (arr) {
        if (this.exports == null) {
            this.exports = {};
        }
        this.includes = [];
        var pckg = res_1.res_groupByType(arr);
        for (var key in pckg) {
            this.include(key, pckg[key]);
        }
        return this;
    };
    Resource.prototype.pause = function () {
        this.state = 2.5;
        var that = this;
        return function (exports) {
            if (arguments.length === 1)
                that.exports = exports;
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
        stack = stack.concat([this]);
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
                    var chain = stack.slice(1).map(function (x, i) { return i + " \u2192 " + x.url; }).join('\n');
                    var isDirect = stack.length <= 1;
                    var message = "Caution: " + (isDirect ? 'Direct ' : '') + " cyclic dependency detected. In " + url + " was " + req + " imported.";
                    if (isDirect === false) {
                        message += " The loop chain is: " + chain;
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
        return this.include(Type_1.ResourceType.Js, PackageExtract(pckg));
    };
    Resource.prototype.inject = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Js, PackageExtract(pckg));
    };
    Resource.prototype.css = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Css, PackageExtract(pckg));
    };
    Resource.prototype.load = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Load, PackageExtract(pckg));
    };
    Resource.prototype.ajax = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Ajax, PackageExtract(pckg));
    };
    Resource.prototype.embed = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Embed, PackageExtract(pckg));
    };
    Resource.prototype.lazy = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Lazy, PackageExtract(pckg));
    };
    Resource.prototype.mask = function () {
        var pckg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            pckg[_i] = arguments[_i];
        }
        return this.include(Type_1.ResourceType.Mask, PackageExtract(pckg));
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
    var type = resource.type, parent = resource.parent, url = resource.url;
    if (document == null && type === 'css') {
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
            ScriptStack_1.ScriptStack.load(resource, parent, type === 'embed');
            break;
        case 'ajax':
        case 'load':
        case 'lazy':
        case 'mask':
            Helper_1.Helper.XHR(resource, onXHRCompleted);
            break;
        case 'css':
            resource.state = 4;
            var tag = document.createElement('link');
            tag.href = url;
            tag.rel = "stylesheet";
            tag.type = "text/css";
            document.body.appendChild(tag);
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
            var tag = document.createElement('style');
            tag.type = "text/css";
            tag.innerHTML = response;
            document.getElementsByTagName('head')[0].appendChild(tag);
            break;
        // case 'mask':
        // 	if (response) {
        // 		var mask = global.mask;
        // 		if (mask == null) {
        // 			mask = global.require('maskjs');
        // 		}
        // 		mask
        // 			.Module
        // 			.registerModule(response, { path: resource.url })
        // 			.done(function (module) {
        // 				resource.exports = module.exports;
        // 				resource.readystatechanged(4);
        // 			})
        // 			.fail(function (error) {
        // 				console.error(error);
        // 				resource.readystatechanged(4);
        // 			});
        // 		return;
        // 	}
        // 	break;
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Resource) && isObject(module.exports)) {
		Object.assign(_src_Resource, module.exports);
		return;
	}
	_src_Resource = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_CustomLoader;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = _src_utils_path;
var Resource_1 = _src_Resource;
var Routing_1 = _src_Routing;
var Helper_1 = _src_Helper;
var cfg = null;
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
function createLoader(url) {
    var extension = path_1.path_getExtension(url), loader = cfg.loader[extension];
    if (loader_isInstance(loader)) {
        return loader;
    }
    var path = loader, namespace;
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
    var delegate = loader_completeDelegate(callback, resource), syncResponse = loader.process(source, resource, delegate);
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
    if (loader.load)
        return loader.load(resource, onLoad);
    Helper_1.Helper.XHR(resource, onLoad);
}
exports.CustomLoader = {
    load: function (resource, callback) {
        var loader = createLoader(resource.url);
        if (loader.process) {
            tryLoad(resource, loader, callback);
            return;
        }
        loader.on(4, function () {
            tryLoad(resource, loader.exports, callback);
        }, null, 'push');
    },
    exists: function (resource) {
        if (!resource.url) {
            return false;
        }
        var ext = path_1.path_getExtension(resource.url);
        var loader = cfg.loader[ext];
        if (loader == null) {
            return false;
        }
        if (loader.supports && loader.supports(resource) === false) {
            return false;
        }
        return true;
    },
    /**
     *	IHandler:
     *	{ process: function(content) { return _handler(content); }; }
     *
     *	Url:
     *	 path to IHandler
     */
    register: function (extension, handler) {
        if (typeof handler === 'string') {
            var resource = include;
            if (resource.location == null) {
                resource = {
                    location: path_1.path_getDir(path_1.path_resolveCurrent())
                };
            }
            handler = path_1.path_resolveUrl(handler, resource);
        }
        cfg.loader[extension] = handler;
    }
};
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_CustomLoader) && isObject(module.exports)) {
		Object.assign(_src_CustomLoader, module.exports);
		return;
	}
	_src_CustomLoader = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_modules_common;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = _src_global;
var Config_1 = _src_Config;
exports.CommonJS = {
    exports: null,
    require: function commonjs(path) {
        if (path.charCodeAt(0) !== 46 && global_1.__require.nativeRequire != null) {
            // .
            return global_1.__require.nativeRequire(path);
        }
        var currentSync = Config_1.cfg.sync;
        var currentEval = Config_1.cfg.eval;
        var currentInclude = include;
        var exports = null;
        Config_1.cfg.sync = true;
        Config_1.cfg.eval = true;
        include.js(path + '::Module').done(function (resp) {
            exports = resp.Module;
        });
        include = currentInclude;
        Config_1.cfg.sync = currentSync;
        Config_1.cfg.eval = currentEval;
        return exports;
    },
    enable: function () {
        // if (typeof __require.nativeRequire === 'function') {
        // 	return;
        // }
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
    Object.defineProperty(global_1.global, 'exports', {
        get: function () {
            var current = global_1.global.include;
            return (current.exports || (current.exports = {}));
        },
        set: function (exports) {
            global_1.global.include.exports = exports;
        },
        configurable: true
    });
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_modules_common) && isObject(module.exports)) {
		Object.assign(_src_modules_common, module.exports);
		return;
	}
	_src_modules_common = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_modules_amd;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        var i = arguments.length, args = new Array(i);
        while (--i > -1)
            args[i] = arguments[i];
        var fn = getFn(patterns, args);
        var module = global_1.global.include;
        fn(module, a, b, c);
    });
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
            define(module, null, null, exports);
        },
    ],
    [
        [isString, isExports],
        function (module, name, exports) {
            define(module, name, null, exports);
        },
    ],
    [
        [isString, isArray, isExports],
        function (module, name, dependencies, exports) {
            define(module, name, dependencies, exports);
        },
    ],
    [
        [isArray, isExports],
        function (module, dependencies, exports) {
            define(module, null, dependencies, exports);
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
function define(module, name, dependencies, exports) {
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_modules_amd) && isObject(module.exports)) {
		Object.assign(_src_modules_amd, module.exports);
		return;
	}
	_src_modules_amd = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_loader_json;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONParser = {
    process: function (source, res) {
        try {
            return JSON.parse(source);
        }
        catch (error) {
            console.error(error, source);
            return null;
        }
    }
};
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_loader_json) && isObject(module.exports)) {
		Object.assign(_src_loader_json, module.exports);
		return;
	}
	_src_loader_json = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_loader_load;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_loader_load) && isObject(module.exports)) {
		Object.assign(_src_loader_load, module.exports);
		return;
	}
	_src_loader_load = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_loader_mask;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_loader_mask) && isObject(module.exports)) {
		Object.assign(_src_loader_mask, module.exports);
		return;
	}
	_src_loader_mask = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Config;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_1 = _src_global;
var CustomLoader_1 = _src_CustomLoader;
var PathResolver_1 = _src_PathResolver;
var common_1 = _src_modules_common;
var amd_1 = _src_modules_amd;
var json_1 = _src_loader_json;
var load_1 = _src_loader_load;
var mask_1 = _src_loader_mask;
var Routing_1 = _src_Routing;
/**
 *	path = root path. @default current working path, im browser window.location;
 *	eval = in node.js this conf. is forced
 *	lockedToFolder = makes current url as root path
 *		Example "/script/main.js" within this window.location "{domain}/apps/1.html"
 *		will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
*/
var isFileProtocol = global_1.document && global_1.document.location && global_1.document.location.protocol === 'file:';
var Config = /** @class */ (function () {
    function Config() {
        this.path = '';
        this.loader = {
            //#if (!NODE)
            'json': json_1.JSONParser,
            //#endif
            'load': load_1.LoadBundleParser,
            'mask': mask_1.MaskLoader,
        };
        this.lockedToFolder = isFileProtocol;
        this.sync = false;
        this.eval = global_1.document == null;
        this.es6Exports = false;
        this.server = false;
        this.logCyclic = false;
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
        case 'extentionDefault':
            PathResolver_1.PathResolver.configExt({ def: value });
            return;
        case 'extentionTypes':
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
CustomLoader_1.inject(cfg);
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Config) && isObject(module.exports)) {
		Object.assign(_src_Config, module.exports);
		return;
	}
	_src_Config = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_utils_path;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Config_1 = _src_Config;
var global_1 = _src_global;
var reg_hasProtocol = /^(file|https?):/i;
function path_getDir(path) {
    return path.substring(0, path.lastIndexOf('/') + 1);
}
exports.path_getDir = path_getDir;
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
function path_getExtension(path) {
    var query = path.indexOf('?');
    if (query === -1) {
        return path.substring(path.lastIndexOf('.') + 1);
    }
    return path.substring(path.lastIndexOf('.', query) + 1, query);
}
exports.path_getExtension = path_getExtension;
function path_resolveBase() {
    var doc = global_1.document;
    var origin = global_1.document.location.origin;
    var path = Config_1.cfg.base || '/';
    if (Config_1.cfg.lockedToFolder) {
        path = doc.location.pathname;
    }
    return path_combine(origin, path, '/');
}
exports.path_resolveBase = path_resolveBase;
function path_resolveCurrent() {
    if (global_1.document == null) {
        return global_1.global.module == null ? '' : path_win32Normalize(process.cwd() + '/');
    }
    var scripts = global_1.document.getElementsByTagName('script'), last = scripts[scripts.length - 1], url = (last && last.getAttribute('src')) || '';
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
    if (path.substring(0, 5) === 'file:')
        return path;
    return 'file:///' + path;
}
exports.path_win32Normalize = path_win32Normalize;
function path_resolveUrl(url, parent) {
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
        case 47:
            // /
            return false;
        case 102:
        // f
        case 104:
            // h
            return reg_hasProtocol.test(path) === false;
    }
    return true;
}
exports.path_isRelative = path_isRelative;
function path_combine() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var out = '', imax = args.length, i = -1, x;
    while (++i < imax) {
        x = args[i];
        if (!x)
            continue;
        x = path_normalize(x);
        if (out === '') {
            out = x;
            continue;
        }
        if (out[out.length - 1] !== '/')
            out += '/';
        if (x[0] === '/')
            x = x.substring(1);
        out += x;
    }
    return out;
}
exports.path_combine = path_combine;
var Path;
(function (Path) {
    var rgx_host = /^\w+:\/\/[^\/]+\//;
    var rgx_subFolder = /\/?([^\/]+\/)?\.\.\//;
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
        do {
            url = path;
            path = path.replace(rgx_dottedFolder, '/');
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_utils_path) && isObject(module.exports)) {
		Object.assign(_src_utils_path, module.exports);
		return;
	}
	_src_utils_path = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Routing;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = _src_utils_path;
var RoutesCtor = /** @class */ (function () {
    function RoutesCtor() {
        this.routes = {};
    }
    /**
     *    @param route {String} = Example: '.reference/libjs/{0}/{1}.js'
     */
    RoutesCtor.prototype.register = function (namespace, route, currentInclude) {
        if (typeof route === 'string') {
            if (path_1.path_isRelative(route)) {
                var location = path_1.path_getDir(path_1.path_resolveCurrent());
                if (path_1.path_isRelative(location)) {
                    location = '/' + location;
                }
                route = location + route;
            }
            if (route[0] === '/') {
                var base = path_1.path_resolveBase();
                route = path_1.path_combine(base, route);
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

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Routing) && isObject(module.exports)) {
		Object.assign(_src_Routing, module.exports);
		return;
	}
	_src_Routing = module.exports;
}());
// end:source ./ModuleSimplified.js

"use strict";
_src_global;
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
// end:source ./umd/umd.js
