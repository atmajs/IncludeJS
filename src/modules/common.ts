import { __require, global } from '../global'
import { cfg } from '../Config'
import { path_resolveUrl } from '../utils/path';

declare let include: any;


export const CommonJS = {
    exports: null,
    require: function commonjs(path) {
        if (path.charCodeAt(0) !== 46) {
            // .
            if (global.module?.require) {
                let moduleBefore = global.module;
                let result = global.module.require(path);

                if (moduleBefore !== global.module) {
                    global.module = moduleBefore;
                }
                return result;
            }
            if (__require.nativeRequire != null) {
                return __require.nativeRequire(path);
            }
        }

        let currentSync = cfg.sync;
        let currentEval = cfg.eval;
        let currentInclude = include;
        let currentModuleDescriptor = Object.getOwnPropertyDescriptor(global, 'module');
        let exports = null;


        cfg.sync = true;
        cfg.eval = true;

        include.instance(include.url, include).js(path + '::Module').done(resp => {
            exports = resp.Module;
        });
        include = currentInclude;

        Object.defineProperty(global, 'module', currentModuleDescriptor);

        cfg.sync = currentSync;
        cfg.eval = currentEval;
        return exports;
    },
    enable () {

        enableExports();
        enableRequire();
    }
};


function enableRequire() {
    global.require = CommonJS.require
}

function enableExports() {
    if (global.module != null) {
        return;
    }
    if (typeof Object.defineProperty === 'undefined') {
        console.warn('Browser do not support Object.defineProperty');
        return;
    }
    Object.defineProperty(global, 'module', {
        get: function () {
            return global.include;
        },
        configurable: true
    });

    let globalExports = null;
    Object.defineProperty(global, 'exports', {
        get: function () {
            let current = global.include;
            if (current == null) {
                return globalExports;
            }
            return current.exports ?? (current.exports = {});
        },
        set: function (exports) {
            globalExports = exports;
            if (global.include) {
                global.include.exports = exports;
            }
        },
        configurable: true
    });
}
