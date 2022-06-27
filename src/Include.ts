import { ResourceType } from './models/Type'
import { IncludeDeferred } from './IncludeDeferred'
import { isBrowser, isNode, IncludeLib } from './global'
import { cfg } from './Config'
import { Routes } from './Routing'
import { Bin, bin, bin_tryReload, bin_remove } from './Bin'
import { path_getDir, path_resolveUrl, path_combine } from './utils/path'
import { CustomLoader } from './CustomLoader'
import { Helper } from './Helper'
import { ScriptStack } from './ScriptStack';
import { PackageArgument, Resource } from './Resource';
import { global, noConflict } from './global'

declare let include: any;



export interface IIncludeData {
    url: string
    namespace: string
    aliases?: string[]
}
export interface IIncludeOptions {
    skipWorker?: boolean
}

export class Include extends IncludeDeferred {

        isBrowser = isBrowser
        isNode = isNode
        isRoot = false

        parent: Resource

        base: string
        location: string

        Lib = IncludeLib

        setCurrent (data: IIncludeData) {
            let url = data.url,
                resource = this.getResourceById(url, 'js');

            if (resource == null) {
                if (url[0] === '/' && this.base)
                    url = this.base + url.substring(1);

                resource = new Resource(
                    'js'
                    , { path: url }
                    , data.namespace
                    , null
                    , null
                    , url);
            }
            if (resource.state < 3) {
                console.error("<include> Resource should be loaded", data);
            }
            if (data.aliases) {
                data.aliases.forEach(alias => {
                    Bin.add(ResourceType.Js, alias, resource);
                })
            }

            /**@TODO - probably state shoulb be changed to 2 at this place */
            resource.state = 3;
            global.include = resource;
        }

        cfg (a, b) {
            return cfg.call(this, a, b);
        }

        routes (path: string, mapping: string | string[])
        routes (routes: { [path: string ]: string | string[] })
        routes (mix) {
            if (mix == null) {
                return Routes.getRoutes();
            }

            if (arguments.length === 2) {
                Routes.register(mix, arguments[1]);
                return this;
            }

            for (let key in mix) {
                Routes.register(key, mix[key]);
            }
            return this;
        }
        promise (namespace: string) {
            let arr = namespace.split('.');
            let obj = global;
            while (arr.length) {
                let key = arr.shift();
                obj = obj[key] || (obj[key] = {});
            }
            return obj;
        }
        /** @TODO - `id` property seems to be unsed and always equal to `url` */
        register (_bin) {

            let base = this.base;

            function transform(info){
                if (base == null)
                    return info;
                if (info.url[0] === '/') {
                    info.url = base + info.url.substring(1);
                }

                if (info.parent[0] === '/') {
                    info.parent = base + info.parent.substring(1);
                }

                info.id = info.url;
                return info;
            }

            for (let key in _bin) {
                let infos = _bin[key];
                let imax = infos.length;
                let i = -1;

                while ( ++i < imax ) {

                    let info = transform(infos[i]);

                    let id = info.url;
                    let url = info.url;
                    let namespace = info.namespace;
                    let parent = info.parent && Bin.find(info.parent);
                    let resource = new Resource();
                    let state = info.state;
                    if (!id || !url) {
                        continue;
                    }

                    if (url) {
                        if (url[0] === '/') {
                            url = url.substring(1);
                        }
                        resource.location = path_getDir(url);
                    }


                    resource.state = state == null
                        ? (key === 'js' ? 3 : 4)
                        : state
                        ;
                    resource.namespace = namespace;
                    resource.type = key as ResourceType;
                    resource.url = url || id;
                    resource.parent = parent;
                    resource.base = parent && parent.base || base;

                    switch (key) {
                    case 'load':
                    case 'lazy':
                        let query = '[data-bundler-path="/' + url + '"]';
                        let bags = IncludeLib.loadBags,
                            j = bags.length,
                            el = null;
                        while( --j > -1 && el == null){
                            if (bags[j] == null) continue;
                            el = bags[j].querySelector(query);
                        }
                        if (el == null) {
                            console.error('"%s" Data was not embedded into html', id);
                            break;
                        }
                        resource.exports = el.innerHTML;
                        if (CustomLoader.exists(resource)){
                            resource.state = 3;
                            CustomLoader.load(resource, CustomLoader_onComplete);
                        }
                        break;
                    }

                    Bin.add(key as ResourceType, id, resource);
                }
            }
            function CustomLoader_onComplete(resource, response) {
                resource.exports = response;
                resource.readystatechanged(4);
            }
        }
        /**
         *    Create new Resource Instance,
         *    as sometimes it is necessary to call include. on new empty context
         */
        instance (url: string, parent?: Resource) {
            return Include.instance(url, parent);
        }

        static instance (url: string, parent?: Resource) {
            if (url == null) {
                let resource = new Include();
                resource.isRoot = true;
                resource.state = 4;
                return resource;
            }
            let resource = new Resource('js');
            resource.state = 4;
            resource.url = path_resolveUrl(url, parent);
            resource.location = path_getDir(resource.url);
            resource.parent = parent;
            resource.isRoot = true;
            return resource;
        }

        noConflict () {
            noConflict();
        }

        getResource(url, type){
            if (this.base && url[0] === '/')
                url = this.base + url.substring(1);

            return this.getResourceById(url, type);
        }
        getResourceById(url, type): Resource {
            let _res = Bin.get(type, url);
            if (_res != null)
                return _res;

            if (this.base && url[0] === '/') {
                _res = Bin.get(type, path_combine(this.base, url));
                if (_res != null)
                    return _res;
            }
            if (this.base && this.location) {
                _res = Bin.get(type, path_combine(this.base, this.location, url));
                if (_res != null)
                    return _res;
            }
            if (this.location) {
                _res = Bin.get(null, path_combine(this.location, url));
                if (_res != null)
                    return _res;
            }
            return null;
        }
        getResources(){
            return bin;
        }
        removeFromCache(path){
            Bin.remove(path);
        }

        plugin(pckg, callback) {

            let urls = [],
                length = 0,
                j = 0,
                i = 0,
                onload = function(url, response) {
                    j++;

                    embedPlugin(response);

                    if (j === length - 1 && callback) {
                        callback();
                        callback = null;
                    }
                };
            Routes.each(null, pckg, function(namespace, route) {
                urls.push(route.path[0] === '/' ? route.path.substring(1) : route.path);
            });

            length = urls.length;

            for (; i < length; i++) {
                Helper.XHR(urls[i], onload);
            }
            return this;
        }

        client(){
            if (cfg.server === true)
                stub_freeze(this);

            return this;
        }

        server(){
            if (cfg.server !== true)
                stub_freeze(this);

            return this;
        }

        use(...args: string[]){
            if (this.parent == null) {
                console.error('<include.use> Parent resource is undefined');
                return this;
            }

            this._usage = args;
            return this;
        }

        pauseStack () {
            return ScriptStack.pause();
        }
        resumeStack () {
            return ScriptStack.resume();
        }

        allDone(callback){
            ScriptStack.complete(function(){

                let pending = include.getPending(),
                    await_ = pending.length;
                if (await_ === 0) {
                    callback();
                    return;
                }

                let i = -1,
                    imax = await_;
                while( ++i < imax ){
                    pending[i].on(4, check, null, 'push');
                }

                function check() {
                    if (--await_ < 1)
                        callback();
                }
            });
        }

        getPending (type){
            let resources = [],
                res, key, id;

            for(key in bin){
                if (key === 'all' || (type != null && type !== key))
                    continue;

                for (id in bin[key]){
                    res = bin[key][id];
                    if (res.state < 4)
                        resources.push(res);
                }
            }

            return resources;
        }


        js (...args) {
            return new Resource(ResourceType.Js).js(...args)
        }
        inject (...args) {
            return new Resource(ResourceType.Js).inject(...args)
        }
        css (...args) {
            return new Resource(ResourceType.Js).css(...args)
        }
        load (...args) {
            return new Resource(ResourceType.Js).load(...args)
        }
        ajax (...args) {
            return new Resource(ResourceType.Js).ajax(...args)
        }
        embed (...args) {
            return new Resource(ResourceType.Js).embed(...args)
        }
        lazy (...args) {
            return new Resource(ResourceType.Js).lazy(...args)
        }
        mask (...args) {
            return new Resource(ResourceType.Js).mask(...args)
        }
        include (type: ResourceType, pckg: PackageArgument, options: IIncludeOptions) {
            return new Resource(ResourceType.Js).include(type, pckg, options);
        }



        bin_tryReload = bin_tryReload
        bin_remove = bin_remove

    };


    // >> FUNCTIONS

    function embedPlugin(source) {
        eval(source);
    }


    function doNothing() {
        return this;
    }

    function stub_freeze(include: Include) {
        include.js =
        include.css =
        include.load =
        include.ajax =
        include.embed =
        include.lazy =
        include.inject =
        include.mask = doNothing;
    }

