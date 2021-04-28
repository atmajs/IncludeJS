import { path_resolveCurrent, path_resolveUrl, path_combine } from './utils/path'
import { Helper } from './Helper'
import { ResourceType } from './models/Type'
import { Routes } from './Routing';


export const PathResolver = {
    configMap(map){
        for (let key in map) {
            _map[key] = map[key];
        }
    },
    configRewrites (rewrites) {
        for (let key in rewrites) {
            _rewrites[key] = rewrites[key];
        }
    },
    configNpm(modules: string[]){
        modules.forEach(name => _npm[name] = 1);
    },
    configExt(config){
        let def = config.def;
        let types = config.types;
        for (let key in def) {
            _ext[key] = def[key];
        }
        for(let key in types) {
            _extTypes[key] = types[key];
        }
    },
    resolveBasic(path_, type, parent) {
        if (type === 'js' && isNodeModuleResolution(path_)) {
            return path_;
        }
        let path = map(path_);
        if (path[0] === '@') {
            let i = path.indexOf('/');
            let namespace = path.substring(0, i);
            let template = path.substring(i + 1);
            let info = Routes.resolve(namespace, template);
            path = info.path;
        }

        path = path_resolveUrl(path, parent);

        let rewritten = rewrite(path);
        if (rewritten != null) {
            path = PathResolver.resolveBasic(rewritten, type, parent);
        }
        return ensureExtension(path, type);
    },
    isNpm: isNodeModuleResolution,
    getType: getTypeForPath,
    resolveNpm(path_, type, parent, cb){
        let path = map(path_);
        if (path.indexOf('.') > -1) {
            cb(null, path);
            return;
        }
        if (type === 'js') {
            if (isNodeModuleResolution(path)) {
                let parentsPath = parent && parent.location;
                if (!parentsPath || parentsPath === '/') {
                    parentsPath = path_resolveCurrent();
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
    isNodeNative (path) {
        return _nodeBuiltIns.indexOf(path) !== -1;
    }
};
let _map = Object.create(null);
let _npm = Object.create(null);
let _rewrites = Object.create(null);
let _ext = {
    'js': 'js',
    'css': 'css',
    'mask': 'mask'
};
let _extTypes: { [ext: string] : ResourceType } = {
    'js': ResourceType.Js,
    'es6': ResourceType.Js,
    'ts': ResourceType.Js,
    'css': ResourceType.Css,
    'less': ResourceType.Css,
    'scss': ResourceType.Css,
    'mask': ResourceType.Mask,
    'json': ResourceType.Load,
    'yml': ResourceType.Load
};
let _nodeBuiltIns = [
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
    return _map[path] ?? path;
}
function rewrite (path: string) {
    for (let key in _rewrites) {
        if (path.endsWith(key)) {
            return _rewrites[key];
        }
    }
    return null;
}
function hasExt(path) {
    return /\.[\w]{1,8}($|\?|#)/.test(path);
}
function isNodeModuleResolution(path: string){
    let aliasIdx = path.indexOf('::');
    if (aliasIdx > - 1)  {
        path = path.substring(0, aliasIdx);
    }

    if (path in _npm) {
        return true;
    }
    let isNpm = /^(@?[\w\-]+)(\/[\w\-_]+)*$/.test(path);
    if (isNpm === false) {
        return false;
    }
    if (path[0] !== '@') {
        return true;
    }
    let namespace = path.substring(0, path.indexOf('/'));
    return Routes.routes[namespace] == null;
}
function nodeModuleResolve(current_, path, cb){
    let name = /^(@?[\w\-]+)/.exec(path)[0];
    let resource = path.substring(name.length + 1);
    if (resource && hasExt(resource) === false) {
        resource += '.js';
    }
    let current = current_.replace(/[^\/]+\.[\w]{1,8}$/, '');
    function check(){
        const dir = path_combine(current, '/node_modules/', name, '/');
        const filename = dir + 'package.json';
        Helper.XHR_LOAD(filename, function(error, text){
            let json;
            if (text) {
                if (typeof text === 'string') {
                    try { json = JSON.parse(text); }
                    catch (error) {}
                } else {
                    json = text;
                }
            }
            if (error != null || json == null) {
                let next = current.replace(/[^\/]+\/?$/, '');
                if (next === current) {
                    cb('Not found');
                    return;
                }
                current = next;
                check();
                return;
            }
            if (resource) {
                cb(null, path_combine(dir, resource));
                return;
            }
            if (json.main) {
                combineMain(dir, json.main, cb);
                return;
            }
            cb(null, dir + 'index.js');
        });
    }
    check();
}
function ensureExtension(path, type) {
    if (hasExt(path)) {
        return path;
    }
    let ext = _ext[type];
    if (ext == null) {
        console.warn('Extension is not defined for ' + type);
        return path;
    }
    let i = path.indexOf('?');
    if (i === -1) return path + '.' + ext;

    return path.substring(0, i) + '.' + ext + path.substring(i);
}
function getTypeForPath(path: string): ResourceType {
    let aliasIdx = path.indexOf('::');
    if (aliasIdx > - 1)  {
        path = path.substring(0, aliasIdx);
    }

    if (isNodeModuleResolution(path)) {
        return ResourceType.Js;
    }
    path = map(path);

    let match = /\.([\w]{1,8})($|\?|:)/.exec(path);
    if (match === null) {
        return _extTypes.js;
    }
    let ext = match[1];
    let type = _extTypes[ext];
    return type || ResourceType.Load;
}

function combineMain (dir, fileName, cb) {
    let path = path_combine(dir, fileName);
    if (hasExt(path)) {
        cb(null, path);
        return;
    }
    let url = path + '.js';
    Helper.XHR_LOAD(url, function(error, text){
        if (error == null) {
            cb(null, url);
            return;
        }
        url = path + '/index.js';
        Helper.XHR_LOAD(url, function(error, text){
            if (error == null) {
                cb(null, url);
                return;
            }
            cb('Entry File does not exist: ' + fileName + ' in ' + dir);
        });
    });
}
