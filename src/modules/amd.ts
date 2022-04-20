import { bin } from '../Bin';
import { CommonJS } from './common';
import { isNode, isBrowser, global, __require } from '../global';
import { Resource } from '../Resource';
export const Amd = {
    enable: function() {
        enable();
    },
};

declare var require: any;

function enable() {
    const define = (global.define = function(a, b, c) {
        var i = arguments.length,
            args = new Array(i);
        while (--i > -1) args[i] = arguments[i];

        var fn = getFn(patterns, args);
        var module = global.include;
        fn(module, a, b, c);
    });
    if (isBrowser) {
        (define as any).amd = true;
    }
    const __includeRequire = (global.require = __require.includeRequire = function amd() {
        if (isNode && __require.nativeRequire && arguments.length === 1) {
            return __require.nativeRequire.apply(null, arguments);
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
        function(module, exports) {
            _define(module, null, null, exports);
        },
    ],
    [
        [isString, isExports],
        function(module, name, exports) {
            _define(module, name, null, exports);
        },
    ],
    [
        [isString, isArray, isExports],
        function(module, name, dependencies, exports) {
            _define(module, name, dependencies, exports);
        },
    ],
    [
        [isArray, isExports],
        function(module, dependencies, exports) {
            _define(module, null, dependencies, exports);
        },
    ],
];
function getFn(patterns, args) {
    var i = -1,
        imax = patterns.length;
    outer: while (++i < imax) {
        var pattern = patterns[i][0];
        if (pattern.length !== args.length) {
            continue;
        }
        var j = -1,
            jmax = pattern.length;
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
function emptyFn() {}
function _define(module, name, dependencies: string[], exports) {
    if (name != null) {
        bin.js[name] = module;
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
        module = new Resource();
    }
    module.require(deps.linked).done(function(resp) {
        readResp(arr, resp);
        module.exports = getExports(exports, arr) || module.exports;
    });
}
function getExports(mix, args = []) {
    if (typeof mix === 'function') {
        return mix.apply(null, args);
    }
    return mix;
}

function getDepsInfo(deps, module) {
    var array = new Array(deps.length),
        linked = [],
        imax = deps.length,
        i = -1;
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
    module: function(module) {
        return module;
    },
    exports: function(module) {
        return module.exports || (module.exports = {});
    },
    require: function(module) {
        return CommonJS.require;
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
    Object.defineProperty(global, 'module', {
        get: function() {
            return global.include;
        },
    });

    Object.defineProperty(global, 'exports', {
        get: function() {
            var current = global.include;
            return current.exports || (current.exports = {});
        },
        set: function(exports) {
            global.include.exports = exports;
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
