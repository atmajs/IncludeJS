var vm = require('vm');
var Module = (global.module || module).constructor;

function __eval (source, include, isGlobalCntx) {
    module.exports = {};

    global.include = include;
    global.require = require;
    global.exports = module.exports;
    global.__filename = path_getFile(include.url);
    global.__dirname = path_getDir(global.__filename);
    global.module = module;

    if (isGlobalCntx !== true) {
        source = '(function(){ ' + source + '\n}())';
    }

    try {
        if (!isGlobalCntx) {
            var filename = global.__filename
            module = new Module(filename, module);
            module.paths = Module._nodeModulePaths(path_getDir(filename));
            module.filename = filename;
            module._compile(source, filename);
            module.loaded = true;
        }

        else {
            vm.runInThisContext(source, global.__filename);
        }

    } catch(e) {
        console.error('Module Evaluation Error', include.url);
        console.error(e.stack);
    }

    if (include.exports == null) {
        var exports = module.exports;

        if (typeof exports !== 'object' || Object.keys(exports).length) {
            include.exports = module.exports;
        }
    }
};
