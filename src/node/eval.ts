import { path_getDir, path_toLocalFile } from '../utils/path'
import { global, include } from '../global'

const Module = require("module")
const vm = require("vm");

declare var CURRENT_MODULE: NodeModule;

if (typeof CURRENT_MODULE === 'undefined') {
    global.CURRENT_MODULE = include;
}

let currentModule: NodeModule = CURRENT_MODULE;


export function internalEval (source: string, include, isGlobalCtx: boolean = false) {
    let module = currentModule;

    global.include = include;
    global.require = global.require;
    global.exports = module.exports;

    //- path_getFile(include.url);//
    let f = path_toLocalFile(include.id ?? include.url);
    global.__filename = f;
    global.__dirname = path_getDir(f);
    global.module = module;

    if (isGlobalCtx !== true) {
        source = '(function(){ ' + source + '\n}())';
    }

    try {
        if (!isGlobalCtx) {
            let filename = global.__filename
            module = currentModule = new Module(filename, module);
            module.paths = (Module as any)._nodeModulePaths(path_getDir(filename));
            module.filename = filename;

            global.module = module;
            (module as any)._compile(source, filename);
            module.loaded = true;
            global.module = currentModule;
        } else {
            module.exports = {};
            vm.runInThisContext(source, global.__filename);
        }

    } catch(e) {
        console.error('Module Evaluation Error', include.url);
        console.error(e.stack);
    }

    if (isEmpty(include.exports)) {
        var exports = module.exports;

        if (typeof exports !== 'object' || isEmpty(exports) === false) {
            include.exports = module.exports;
        }
    }
};

function isEmpty (exports) {
    for (var key in exports) {
        if (key in Object.prototype === false) {
            return false;
        }
    }
    return true;
}
