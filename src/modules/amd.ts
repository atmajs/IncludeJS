import { bin } from '../Bin';
import { CommonJS } from './common';
import { isNode, isBrowser, global, __require } from '../global';
import { Resource } from '../Resource';
import { ResourceType } from '../models/Type';
import { State } from '../models/State';
import { PathResolver } from '../PathResolver';
export const Amd = {
    enable () {
        enable();
    },
    isEnabled () {
        return enabled;
    }
};

declare let require: any;
declare let include: Resource;

let requireGlobalCtx = typeof require === 'function' ? require : null;
let enabled = false;

function enable() {
    if (enabled) {
        return;
    }

    enabled = true;

    const define = (global.define = function(a, b, c) {
        let i = arguments.length;
        let args = new Array(i);
        while (--i > -1) {
            args[i] = arguments[i];
        }

        let fn = getFn(patterns, args);
        let module = global.include;
        fn(module, a, b, c);
    });
    if (isBrowser) {
        (define as any).amd = true;
    }
    const __includeRequire = (global.require = __require.includeRequire = function amd() {
        if (arguments.length === 1 && typeof arguments[0] ==='string') {
            let path = arguments[0];
            let url = include?.resolvePath(path);
            let resource = include?.getResource(url, ResourceType.Js);
            if (resource != null && resource.state === State.AllCompleted) {
                return resource.exports;
            }

            let requireCurrentCtx = typeof require === 'function' && require !== __includeRequire
                ? require : null;

            if (typeof requireCurrentCtx === 'function') {
                try {
                    return requireCurrentCtx(path);
                } catch (e) { }
            }
            if (typeof requireGlobalCtx === 'function') {
                try {
                    return requireGlobalCtx(path);
                } catch (e) { }
            }
            if (__require.nativeRequire != null) {
                try {
                    return __require.nativeRequire(path);
                } catch (e) { }
            }
            throw new Error(`Module not found: ${ JSON.stringify(arguments) }`);
        }
        return define.apply(null, arguments);
    });
    if (typeof require !== 'undefined') {
        require = __includeRequire;
    }
}
let patterns = [
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
    let i = -1,
        imax = patterns.length;
    outer: while (++i < imax) {
        let pattern = patterns[i][0];
        if (pattern.length !== args.length) {
            continue;
        }
        let j = -1,
            jmax = pattern.length;
        while (++j < jmax) {
            let matcher = pattern[j];
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
function _define(module, name: string, dependencies: string[], exports) {

    if (name != null) {
        let path = PathResolver.resolveBasic(name, ResourceType.Js, module);
        if (path.endsWith(module.id) === false) {
            // We have additional define registration in the module

            let aliases = [ name ];
            let includeGlobal = include;
            include.register({"js":[{"type":"js","url": path}]});
            let resource = include.setCurrent({ url: path, aliases });
            _define(resource, null, dependencies, exports);
            resource.readystatechanged(3);
            include = includeGlobal;
            return
        }
    }
    if (name != null) {
        bin.js[name] = module;
    }
    if (dependencies == null) {
        module.exports = getExports(exports) || module.exports;
        return;
    }
    let deps = getDepsInfo(dependencies, module);
    let arr = deps.array;
    let linked = deps.linked;
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
    let array = new Array(deps.length),
        linked = [],
        imax = deps.length,
        i = -1;
    while (++i < imax) {
        let fn = StaticResolvers[deps[i]];
        if (fn == null) {
            linked.push(deps[i] + '::' + i);
            continue;
        }
        array[i] = fn(module);
    }
    return { array: array, linked: linked };
}
let StaticResolvers = {
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
            let current = global.include;
            return current.exports || (current.exports = {});
        },
        set: function(exports) {
            global.include.exports = exports;
        },
    });
}

function readResp(arr, resp) {
    let digit = /^\d+$/;
    for (let key in resp) {
        let val = resp[key];
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
