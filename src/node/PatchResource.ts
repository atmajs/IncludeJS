import { Resource, PackageArgument } from '../Resource'
import { path_getFile, path_getDir, path_combine, path_normalize, path_resolveUrl, path_resolveCurrent, path_resolveBase } from '../utils/path';
import { State } from '../models/State'
import { ResourceType } from '../models/Type'
import { arr_indexOf } from '../utils/array';
import { __require, refs, global } from '../global';
import { fs_exists } from './utils/file';
import { Include } from '../Include'
import { bin } from '../Bin'

import * as Module from 'module'


let npmPath;
let atmaPath;
let moduleRoot: Module;

Resource.prototype.path_getFile = function() {
    return path_getFile(this.url);
};

Resource.prototype.path_getDir = function() {
    return path_getDir(path_getFile(this.url));
};

Resource.prototype.inject = function(...args) {

    let pckg = args.length === 1 ?
        args[0] :
        args;

    this.state = this.state >= State.Evaluated ? State.Evaluated : State.Evaluating;

    let current = this as Resource,
        bundle = current.create(ResourceType.Js).resource;

    bundle.url = this.url;
    bundle.location = this.location;

    bundle
        .load(pckg as PackageArgument)
        .done(function(resp) {

            bundle.state = 3;
            bundle.on(4, function() {

                let remove = 1;
                let index = arr_indexOf(current.includes, function(res) {
                    return res.resource === bundle;
                });
                if (index === -1) {
                    index = current.includes.length - 1;
                    remove = 0;
                }

                current
                    .includes
                    .splice
                    .apply(current.includes, ([index, remove] as any[]).concat(bundle.includes));

                current.readystatechanged(3);
            });

            inject_process(bundle, 0);
        });

    return current;
};

Resource.prototype.embed = function() {
    return this.js.apply(this, arguments);
};

Resource.prototype.instance = function(currentUrl, parent) {
    if (typeof currentUrl === 'string') {

        moduleRoot ??= global.module;

        let path = currentUrl === '' || currentUrl === '/'
            ? moduleRoot.id
            : currentUrl;

        if (path[0] === '/') {
            path = path_combine(path_resolveBase(), path);
        }

        let next = new Module(path, moduleRoot);

        next.filename = path_getFile(path);
        next.paths = (Module as any)._nodeModulePaths(path_getDir(next.filename));


        if (npmPath == null) {

            let PATH = process.env.PATH || process.env.path,
                delimiter = require('path').delimiter,
                parts = PATH.split(delimiter);

            let i = parts.length,
                rgx = /([\\\/]npm[\\\/])|([\\\/]npm$)/gi;
            while (--i > -1) {
                if (rgx.test(parts[i])) {
                    npmPath = parts[i];
                    break;
                }
            }

            if (npmPath == null && process.platform !== 'win32') {
                [
                    '/usr/lib/node_modules',
                    '/usr/local/lib/node_modules'
                ].forEach(function(path) {

                    if (npmPath == null && fs_exists(path))
                        npmPath = path;
                });
            }

            if (npmPath) {
                if (npmPath.indexOf('node_modules') === -1)
                    npmPath = path_combine(npmPath, 'node_modules');

                atmaPath = path_combine(
                    path_getDir(
                        path_normalize(
                            process.mainModule.filename
                        )), 'node_modules'
                );
            } else {
                npmPath = false;
                console.warn(
                    'Could not resolve global NPM Directory from system path (%s)',
                    delimiter,
                    PATH
                );
            }
        }


        if (atmaPath) {
            next.paths.push(atmaPath);
        }
        if (npmPath) {
            next.paths.push(npmPath);
        }


        global.module = module = next;

        let req = next.require.bind(next);
        if (__require.includeRequire == null) {
            global.require = require = req;
        } else {
            __require.nativeRequire = req;
        }

    }

    let resource;
    if (currentUrl == null) {
        resource = new Include();
        resource.state = 4;
        return resource;
    }
    resource = new Resource('js');
    resource.state = 4;
    resource.url = path_resolveUrl(currentUrl, parent);
    resource.location = path_getDir(resource.url);
    resource.parent = parent;
    return resource;
};



function inject_process(bundle, index: number) {
    if (index >= bundle.includes.length) {
        bundle.readystatechanged(4);
        return;
    }

    let include = bundle.includes[index];
    let resource = include.resource;
    let alias = include.route.alias;
    let source = resource.source || resource.exports;

    if (resource.state === 4) {
        if (resource.exports && alias) {
            global[alias] = resource.exports;
        }
        inject_process(bundle, ++index);
        return;
    }

    resource.exports = null;
    resource.type = 'js';
    resource.includes = null;
    resource.state = 3;
    resource.parent = null;

    for (let key in bin.load) {
        if (bin.load[key] === resource) {
            delete bin.load[key];
            break;
        }
    }

    try {
        refs.evaluate(source, resource, true);
    } catch (error) {
        console.error('<inject> Evaluation error', resource.url, error);
        resource.state = 4;
    }

    resource.readystatechanged(3);
    resource.on(4, function() {

        if (resource.exports && alias) {
            global[alias] = resource.exports;
        }

        inject_process(bundle, ++index);
    });
}
