import { global } from './global'
import { IIncludeOptions, Include } from './Include'
import { Bin } from './Bin'
import { path_normalize, path_resolveCurrent, path_getDir } from './utils/path';
import { PathResolver } from './PathResolver';
import { ScriptStack } from './ScriptStack';
import { isNode, __require } from './global'
import { res_groupByType } from './utils/res'
import { Routes } from './Routing';
import { CustomLoader } from './CustomLoader';
import { Helper } from './Helper';
import { LazyModule } from './LazyModule'
import { ResourceType } from './models/Type'
import { cfg } from './Config';
import { document } from './global'

export class Resource extends Include {

    id: string
    url: string
    namespace: string
    xpath: string
    priority: number
    options: IIncludeOptions
    route: any

    exports: any
    response: any
    source: string
    error?: Error

    loaderType: 'import' | 'embed' | 'eval';

    constructor(type = null, route = null, namespace = null, xpath = null, parent: Resource = null, id = null, priority = null, opts: IIncludeOptions = null) {
        super();

        let url = route?.path;
        if (url != null) {
            url = path_normalize(url);
            url = PathResolver.resolveBasic(url, type, parent);
        }
        if (id == null && url) {
            id = url;
        }

        let resource = Bin.get(type, id);
        let isOfOtherType = false;
        if (resource) {
            if (type === 'js' && resource.state < 4) {
                ScriptStack.moveToParent(resource, parent);
            }
            isOfOtherType = type != null && resource.type === 'load' && type !== 'load';
            if (isOfOtherType === false) {
                return resource;
            }
        }

        this.id = id;
        this.url = url;
        this.type = type;
        this.xpath = xpath;
        this.route = route;
        this.parent = parent;
        this.priority = priority;
        this.namespace = namespace;
        this.base = parent && parent.base;
        this.childLoaded = this.childLoaded.bind(this);
        this.response = {};
        this.exports = {};
        this.options = opts;

        if (type == null) {
            this.state = 3;
            return this;
        }
        if (type === 'embed') {
            this.loaderType = 'embed';
        }
        if (url == null) {
            this.state = 3;
            this.url = path_resolveCurrent();
            this.location = path_getDir(this.url);
            return this;
        }

        this.state = 0;
        this.location = path_getDir(url);

        Bin.add(type, id, this);

        if (isOfOtherType) {
            onXHRCompleted(this, resource.exports);
        }

        let isNpm = PathResolver.isNpm(this.url);
        if (isNpm && isNode) {
            const before = global.include;
            global.include = this;

            try {
                this.exports = __require.nativeRequire(this.url);

                if (before != null && global.include === this) {
                    global.include = before;
                }
                this.readystatechanged(4);
            } catch (error) {
                if (error.code == 'ERR_REQUIRE_ESM') {

                    this.loaderType = 'import';
                    process(this);
                    return this;
                }
                throw error;
            }
            return this;
        }
        if (isNpm === false) {
            process(this);
            return this;
        }
        PathResolver.resolveNpm(this.url, this.type, this.parent, (error, url, loaderType) => {
            if (error) {
                this.readystatechanged(4);
                return;
            }
            if (loaderType) {
                this.loaderType = loaderType;
            }
            this.url = url;
            this.location = path_getDir(url);
            process(this);
        });
        return this;
    }




    setBase(baseUrl: string): this {
        this.base = baseUrl;
        return this;
    }

    hasPendingChildren() {
        let arr = this.includes;
        if (arr == null) {
            return false;
        }
        let imax = arr.length,
            i = -1;
        while (++i < imax) {
            if (arr[i].isCyclic) {
                continue;
            }
            if (arr[i].resource.state !== 4) {
                return true;
            }
        }
        return false;
    }

    childLoaded(child) {
        let includes = this.includes;
        if (includes && includes.length) {
            if (this.state < 3) {
                // resource still loading/include is in process, but one of sub resources are already done
                return;
            }
            for (let i = 0; i < includes.length; i++) {
                let data = includes[i];
                if (data.isCyclic) {
                    continue;
                }
                if (data.resource.state !== 4) {
                    return;
                }
            }
        }
        this.readystatechanged(4);
    }
    create(type: ResourceType, route = null, namespace = null, xpath = null, id = null, options: IIncludeOptions = null) {
        this.state = this.state >= 3
            ? 3
            : 2;

        if (this.includes == null) {
            this.includes = [];
        }

        let resource = new Resource(type, route, namespace, xpath, this, id, null, options);
        let isLazy = false;
        if (this.url && cfg.lazy) {
            outer: for (let str in cfg.lazy) {
                let rgx = new RegExp(str);
                if (rgx.test(this.url)) {
                    let paths = cfg.lazy[str];
                    for (let i = 0; i < paths.length; i++) {
                        let rgxPath = new RegExp(paths[i]);
                        if (rgxPath.test(resource.url)) {
                            isLazy = true;
                            break outer;
                        }
                    }
                }
            }
        }
        let data = {
            resource: resource,
            route: route,
            isCyclic: isLazy || resource.contains(this.url),
            isLazy: isLazy
        };
        this.includes.push(data);
        return data;
    }
    include (type: ResourceType, pckg: PackageArgument, options: IIncludeOptions) {
        let children = [];
        let child;

        Routes.each(type, pckg, (namespace, route, xpath) => {
            if (this.route != null && this.route.path === route.path) {
                // loading itself
                return;
            }
            child = this.create(type, route, namespace, xpath, null, options);
            children.push(child);
        });

        let i = -1;
        let imax = children.length;
        while (++i < imax) {
            let x = children[i];
            if (x.isCyclic) {
                this.childLoaded(x.resource);
                continue;
            }
            x.resource.on(4, this.childLoaded);
        }

        return this;
    }
    require(arr: string[], options?: IIncludeOptions) {
        if (this.exports == null) {
            this.exports = {};
        }
        this.includes = [];

        let pckg = res_groupByType(arr);
        for (let key in pckg) {
            this.include(key as ResourceType, pckg[key], options);
        }
        return this;
    }

    pause() {
        this.state = 2.5;

        const that = this;
        return function (exports) {
            if (arguments.length === 1) {
                that.exports = exports;
            }
            that.readystatechanged(3);
        };
    }
    contains(url, stack: Resource[] = [], refCache = {}) {

        refCache[this.url] = this;
        let arr = this.includes;
        if (arr == null) {
            return false;
        }
        stack = [...stack, this];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].isLazy) {
                continue;
            }
            if (arr[i].resource.url in refCache) {
                continue;
            }
            if (arr[i].resource.url === url) {
                if (cfg.logCyclic) {
                    let req = stack[0].url;
                    let chain = stack.slice(1).map((x, i) => `${i} → ${x.url}`).join('\n');
                    let isDirect = stack.length <= 1;
                    let message = `Caution: ${isDirect ? 'Direct ' : ''} cyclic dependency detected. In ${url} was ${req} imported.`
                    if (isDirect === false) {
                        message += ` The loop chain is: ${chain}`
                    }
                    console.log(message);
                }
                return true;
            }
            if (arr[i].resource.contains(url, stack, refCache)) {
                return true;
            }
        }
        return false;
    }
    getNestedOfType(type) {
        return resource_getChildren(this.includes, type);
    }


    js (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Js, PackageExtract(pckg), null)
    }
    inject (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Js, PackageExtract(pckg), null)
    }
    css (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Css, PackageExtract(pckg), null)
    }
    load (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Load, PackageExtract(pckg), null)
    }
    ajax (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Ajax, PackageExtract(pckg), null)
    }
    embed (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Embed, PackageExtract(pckg), null)
    }
    lazy (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Lazy, PackageExtract(pckg), null)
    }
    mask (...pckg: PackageArgument[]) {
        return this.include(ResourceType.Mask, PackageExtract(pckg), null)
    }

    path_getFile: Function
    path_getDir: Function
};

export declare type PackageArgument = string | string[] | { [namespace: string]: string | string[] };

function PackageExtract(pckg: any[]): PackageArgument {
    if (pckg.length > 1) return pckg;
    if (Array.isArray(pckg[0])) return pckg[0];
    return pckg;
}

// private

function process(resource: Resource) {
    let { type, url, parent } = resource;

    if (document == null && type === 'css') {
        resource.state = 4;
        return resource;
    }


    if (CustomLoader.exists(resource)) {
        if ('js' === type || 'embed' === type) {
            ScriptStack.add(resource, resource.parent);
        }

        CustomLoader.load(resource, onXHRCompleted);
        return resource;
    }

    switch (type) {
        case 'js':
        case 'embed':
            ScriptStack.load(resource, parent);
            break;
        case 'ajax':
        case 'load':
        case 'lazy':
        case 'mask':
            Helper.XHR(resource, onXHRCompleted);
            break;
        case 'css':
            resource.state = 4;

            let tag = document.createElement('link');
            tag.href = url;
            tag.rel = "stylesheet";
            tag.type = "text/css";
            document.body.appendChild(tag);
            break;
    }

    return resource;
}

function onXHRCompleted(resource, response) {
    if (!response) {
        console.warn('Resource can`t be loaded', resource.url);
        //- resource.readystatechanged(4);
        //- return;
    }
    switch (resource.type) {
        case 'js':
        case 'embed':
            resource.source = response;
            resource.state = 2;
            ScriptStack.touch();
            return;
        case 'load':
        case 'ajax':
        case 'mask':
            resource.exports = response;
            break;
        case 'lazy':
            LazyModule.create(resource.xpath, response);
            break;
        case 'css':
            let tag = document.createElement('style');
            tag.type = "text/css";
            tag.innerHTML = response;
            document.getElementsByTagName('head')[0].appendChild(tag);
            break;
        // case 'mask':
        //     if (response) {
        //         let mask = global.mask;
        //         if (mask == null) {
        //             mask = global.require('maskjs');
        //         }
        //         mask
        //             .Module
        //             .registerModule(response, { path: resource.url })
        //             .done(function (module) {
        //                 resource.exports = module.exports;
        //                 resource.readystatechanged(4);
        //             })
        //             .fail(function (error) {
        //                 console.error(error);
        //                 resource.readystatechanged(4);
        //             });
        //         return;
        //     }
        //     break;
    }

    resource.readystatechanged(4);
}

function resource_getChildren(includes, type, out = []) {
    if (includes == null)
        return null;

    let imax = includes.length,
        i = -1,
        x;
    while (++i < imax) {
        x = includes[i].resource;

        if (type === x.type)
            out.push(x);

        if (x.includes != null)
            resource_getChildren(x.includes, type, out);
    }
    return out;
}
