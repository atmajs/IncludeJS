import { document } from './global'
import { CustomLoader, inject as initializeLoader } from './CustomLoader'
import { PathResolver } from './PathResolver'
import { CommonJS } from './modules/common'
import { Amd } from './modules/amd'
import { JSONParser } from './loader/json'
import { LoadBundleParser } from './loader/load'
import { MaskLoader } from './loader/mask'
import { Routes } from './Routing';


declare var global: any;

/**
 *    path = root path. @default current working path, im browser window.location;
 *    eval = in node.js this conf. is forced
 *    lockedToFolder = makes current url as root path
 *        Example "/script/main.js" within this window.location "{domain}/apps/1.html"
 *        will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
*/

const isFileProtocol = document && document.location && document.location.protocol === 'file:';

class Config {

    path: string = ''
    base: string = null
    loader: any = {
        //#if (!NODE)
        'json': JSONParser,
        //#endif
        'load': LoadBundleParser,
        'mask': MaskLoader,
    }
    version: string = null
    lockedToFolder = isFileProtocol
    sync = false
    eval = document == null

    es6Exports = false
    server = false
    logCyclic = false
    workerSuffix = 'worker'

    autoreload: { fileChanged: Function } = null

    lazy: {
        [rgx: string]: string[]
    } = null

    call(ctx, a, b) {
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
    }

};

type TConfigKey = 'loader' | 'modules' | 'commonjs' | 'amd' | 'map' | 'npm' | 'extensionDefault' | 'extentionTypes' | 'routes' ;

function set(cfg: Config, key: TConfigKey | string, value: any) {
    switch (key) {
        case 'loader':
            for (var x in value) {
                CustomLoader.register(x, value[x]);
            }
            return;
        case 'modules':
            if (value === true) enableModules();
            return;
        case 'commonjs':
            if (value === true) CommonJS.enable();
            return;
        case 'amd':
            if (value === true) Amd.enable();
            return;
        case 'map':
            PathResolver.configMap(value);
            return;
        case 'rewrite':
            PathResolver.configRewrites(value);
            return;
        case 'npm':
            PathResolver.configNpm(value);
            return;
        case 'extensionDefault':
        // typo: but back comp it
        case 'extentionDefault':
            PathResolver.configExt({ def: value });
            return;
        case 'extentionTypes':
            PathResolver.configExt({ types: value });
            return;
        case 'routes':
            for (let pfx in value) {
                Routes.register(pfx, value[pfx]);
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

const cfg = new Config;

initializeLoader(cfg);

export {
    Config,
    cfg
};
