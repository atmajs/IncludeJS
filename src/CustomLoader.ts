import { path_getExtension, path_getDir, path_resolveCurrent, path_resolveUrl } from './utils/path';
import { Resource } from './Resource';
import { Routes } from './Routing';
import { Helper } from './Helper';
import { Config } from './Config';
import { WorkerLoader } from './worker/WorkerLoader';
import { IIncludeOptions } from './Include';


/** GLOBAL */
declare var include: any;

let cfg: Config = null;
let workerLoader = new WorkerLoader();

export function inject(cfg_: Config) {
    cfg = cfg_;
};

function loader_isInstance(x) {
    if (typeof x === 'string')
        return false;

    return typeof x.ready === 'function' || typeof x.process === 'function';
}

function createLoader(url: string, options: IIncludeOptions) {
    if (workerLoader.supports(url) && options?.skipWorker !== true) {
        return workerLoader;
    }

    let extension = path_getExtension(url);
    let loader = cfg.loader[extension];

    if (loader_isInstance(loader)) {
        return loader;
    }

    let path = loader;
    let namespace;

    if (typeof path === 'object') {
        // is route {namespace: path}
        for (var key in path) {
            namespace = key;
            path = path[key];
            break;
        }
    }

    return (cfg.loader[extension] = new Resource(
        'js',
        Routes.resolve(namespace, path),
        namespace,
        null,
        null,
        null,
        1
    ));
}

function loader_completeDelegate(callback, resource) {
    return function (response) {
        callback(resource, response);
    };
}

function loader_process(source: string | any, resource: Resource, loader, callback) {
    if (loader.process == null) {
        callback(resource, source);
        return;
    }

    let delegate = loader_completeDelegate(callback, resource);
    let syncResponse = loader.process(source, resource, delegate);

    // match also null
    if (typeof syncResponse !== 'undefined') {
        callback(resource, syncResponse);
    }
}

function tryLoad(resource: Resource, loader, callback) {
    if (typeof resource.exports === 'string') {
        loader_process(resource.exports, resource, loader, callback);
        return;
    }

    function onLoad(resource, response) {
        loader_process(response, resource, loader, callback);
    }
    if (loader.load) {
        return loader.load(resource, onLoad);
    }
    Helper.XHR(resource, onLoad);
}

export const CustomLoader = {
    load(resource: Resource, callback) {

        let loader = createLoader(resource.url, resource.options);
        if (loader.process) {
            tryLoad(resource, loader, callback);
            return;
        }

        loader.on(4, function () {
            tryLoad(resource, loader.exports, callback);
        }, null, 'push');
    },
    exists(resource: Resource) {
        if (!resource.url) {
            return false;
        }

        if (workerLoader.supports(resource.url) && resource.options?.skipWorker !== true) {
            return true;
        }

        let ext = path_getExtension(resource.url);
        let loader = cfg.loader[ext];
        if (loader == null) {
            return false;
        }
        if (loader.supports?.(resource) === false) {
            return false;
        }
        return true;
    },

    /**
     *    IHandler:
     *    { process (content) { return _handler(content); }; }
     *
     *    Url:
     *     path to IHandler
     */
    register(extension, handler) {
        if (typeof handler === 'string') {

            let resource = include;
            if (resource.location == null) {
                resource = {
                    location: path_getDir(path_resolveCurrent())
                };
            }
            handler = path_resolveUrl(handler, resource);
        }
        cfg.loader[extension] = handler;
    }
};

