import { __require, global } from '../global'
import { cfg } from '../Config'
import type { Resource } from '../Resource';
import { ResourceType } from '../models/Type';
import { State } from '../models/State';

declare let include: Resource;
declare let require: any;

let requireGlobalCtx = typeof require === 'function' ? require : null;
let enabled = false;

const CommonJSInternal = {
    exports: null,
    require: function commonjs(path) {
        let url = include?.resolvePath(path);
        let resource = include?.getResource(url, ResourceType.Js);
        if (resource != null && resource.state === State.AllCompleted) {
            return resource.exports;
        }

        let requireCurrentCtx = typeof require === 'function' && require !== CommonJSInternal.require
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
        if (enabled) {
            return;
        }
        enabled = true;
        enableExports();
        enableRequire();
    }
};



function enableRequire() {
    global.require = CommonJSInternal.require
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


export const CommonJS = CommonJSInternal;
