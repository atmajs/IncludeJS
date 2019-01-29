import * as vm from 'vm';
import * as Module from 'module';
import { path_getFile, path_getDir } from '../utils/path'
import { global } from '../global'

declare var CURRENT_MODULE: NodeModule;



let currentModule: NodeModule = CURRENT_MODULE;

export function internalEval (source: string, include, isGlobalCtx: boolean = false) {
    let module = currentModule;

    global.include = include;
    global.require = global.require;
    global.exports = module.exports;
    global.__filename = path_getFile(include.url);
    global.__dirname = path_getDir(global.__filename);
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
            (module as any)._compile(source, filename);
            module.loaded = true;
        }

        else {
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
