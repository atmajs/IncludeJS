import {
    path_resolveCurrent,
    path_resolveUrl,
    path_combine,
    path_getDir,
    path_cdUp,
    path_hasExtension,
    path_getExtension
} from './utils/path';
import { Helper } from './Helper';
import { ResourceType } from './models/Type';
import { Routes } from './Routing';
import { isBrowser } from './global';
import { type Resource } from './Resource';


type TResourceData = {
    path: string
    module?: 'import' | 'commonjs' | 'umd'
}

export const PathResolver = {
    configMap(map: Record<string, string | TResourceData>) {
        for (let key in map) {
            let value = map[key];

            _map[key] = typeof value === 'string'
                ? { path: value }
                : value;
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
    resolveBasic(path_: string, type: ResourceType, parent: Resource) {
        let { path } = map(path_);

        if (type === 'js' && isNodeModuleResolution(path) || path.includes('!')) {
            return path;
        }

        let i = path.indexOf('/');
        let namespace = path.substring(0, i);
        if (Routes.has(namespace)) {
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
    resolveBasicWithData(path_: string, type: ResourceType, parent: Resource): TResourceData {
        let mapped1 = map(path_);
        let path = PathResolver.resolveBasic(path_, type, parent);
        let mapped2 = map(path);
        let data = {
            path,
            module: mapped1?.module
                ?? mapped2?.module
                ?? (path.includes('/esm/') ? 'import' : null)
        };
        return data;
    },
    isNpm: isNodeModuleResolution,
    getType: getTypeForPath,
    resolveNpm(path_: string, type, parent, cb){
        let { path } = map(path_);
        if (path_hasExtension(path)) {
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
        if (path_hasExtension(path) === false) {
            path += '.' + _ext[type];
        }
        cb(null, path);
    },
    isNodeNative (path: string) {
        return _nodeBuiltIns.indexOf(path) !== -1 || path.startsWith('node:');
    }
};
let _map = Object.create(null) as Record<string, TResourceData>;
let _npm = Object.create(null);
let _rewrites = Object.create(null);
let _ext = {
    'js': 'js',
    'css': 'css',
    'mask': 'mask'
};
let _extTypes: { [ext: string] : ResourceType } = {
    'js': ResourceType.Js,
    'mjs': ResourceType.Js,
    'cjs': ResourceType.Js,
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
function map(path: string) {
    return _map[path] ?? { path };
}
function rewrite (path: string) {
    for (let key in _rewrites) {
        if (path.endsWith(key)) {
            return _rewrites[key];
        }
    }
    return null;
}
function isNodeModuleResolution(path: string){
    let aliasIdx = path.indexOf('::');
    if (aliasIdx > - 1)  {
        path = path.substring(0, aliasIdx);
    }
    if (path in _npm) {
        return true;
    }
    // npm name
    let rgx_ROOT = /^@?[\w\-_]+$/;
    // npm name with path or npm organization with name and/or path
    let rgx_withPath = /^(@?[\w_]+[\w\-_\.]*)(\/[\w\-_]+)+$/;

    let isNpm = rgx_ROOT.test(path) || rgx_withPath.test(path);
    if (isNpm === false) {
        return false;
    }
    // if namespace is present, most likely is not the npm package.
    let namespace = path.substring(0, path.indexOf('/'));
    return Routes.routes[namespace] == null;
}

namespace dir {
    export function getRoot (dirpath: string) {
        let end = dirpath.indexOf('/');
        if (end === -1) {
            end = dirpath.length;
        }
        return dirpath.substring(0, end);
    }
    export function getName(dirpath: string) {
        let lastIndexOf = null;
        if (dirpath.endsWith('/')) {
            lastIndexOf = dirpath.length - 2;
        }
        let start = dirpath.lastIndexOf(dirpath, lastIndexOf);
        return dirpath.substring(start + 1, lastIndexOf);
    }
    export function trimStart(path: string) {
        return path.replace(/^\/+/, '');
    }
    export function trimEnd(path: string) {
        return path.replace(/\/+$/, '');
    }
}

export namespace NodeModulePaths {
    export function getPaths (currentPath: string, packageName: string): string[] {
        let paths = [];
        let pckg = `/node_modules/${packageName}/package.json`
        if (isBrowser) {
            paths.push(pckg);
        }
        let dir = path_getDir(currentPath);
        while (true) {
            let path = path_combine(dir, pckg);
            paths.push(path);
            let next = path_cdUp(dir);
            if (next === dir) {
                break;
            }
            dir = next;
        }
        return paths;
    }
}

async function nodeModuleResolve(current_: string, path: string, cb: (err, path?: string, loaderType?: Resource['loaderType']) => void){
    let name = dir.getRoot(path);
    let resource = dir.trimStart(path.substring(name.length));
    if (name.startsWith('@')) {
        let subname = dir.getRoot(resource);
        resource = dir.trimStart(resource.substring(subname.length));
        name = `${name}/${subname}`;
    }
    let paths = NodeModulePaths.getPaths(current_, name);
    let loaderType = null;
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i];
        let resp = await Helper.XHR_LOAD(path);
        if (resp.status !== 200) {
            continue;
        }
        if (!resource) {
            let json;
            let text = resp.body;
            if (typeof text === 'string') {
                json = JSON.parse(text);
            } else {
                json = text;
            }
            resource = isBrowser && json.browser ? json.browser : json.main;
            if (json.type === 'module') {
                loaderType = 'import';
            }
        }
        if (path_hasExtension(resource) === false) {
            resource += '.js';
        }
        let main = path_combine(path.replace('package.json', ''), resource);
        cb(null, main, loaderType);
        return;
    }
    cb('Not found');
}
function nodeModuleResolveOld(current_, path, cb){
    let name = /^(@?[\w\-]+)/.exec(path)[0];
    let resource = path.substring(name.length + 1);
    if (resource && path_hasExtension(resource) === false) {
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
            let main = isBrowser && json.browser ? json.browser : json.main;
            if (main) {
                combineMain(dir, main, cb);
                return;
            }
            cb(null, dir + 'index.js');
        });
    }
    check();
}
function ensureExtension(path: string, type: string) {
    if (path_hasExtension(path)) {
        let ext = path_getExtension(path);
        if (type !== 'js' || ext in _extTypes) {
            // For scripts we return only if the extension is known.
            return path;
        }
    }
    let ext = _ext[type];
    if (ext == null) {
        console.warn('Extension is not defined for ' + type);
        return path;
    }
    let i = path.indexOf('?');
    if (i === -1) {
        return path + '.' + ext;
    }
    return path.substring(0, i) + '.' + ext + path.substring(i);
}
function getTypeForPath(path_: string): ResourceType {
    let aliasIdx = path_.indexOf('::');
    if (aliasIdx > - 1)  {
        path_ = path_.substring(0, aliasIdx);
    }

    if (isNodeModuleResolution(path_)) {
        return ResourceType.Js;
    }
    let { path } = map(path_);

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
    if (path_hasExtension(path)) {
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
