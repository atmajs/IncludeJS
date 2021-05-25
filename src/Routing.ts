import { path_isRelative, path_getDir, path_resolveCurrent, path_combine, path_resolveBase } from './utils/path'
import { ResourceType } from './models/Type';
import { PackageArgument } from './Resource';
import { cfg } from './Config';

declare var include: any;


export class RoutesCtor {

    routes: { [namespace: string]: string[] } = {};

    /**
     *    @param route {String} = Example: '.reference/libjs/{0}/{1}.js'
     */
    register(namespace: string, route: string | string[]) {

        if (namespace.endsWith('/*')) {
            // like TS paths, '@foo/*': [ 'foo/ts/*' ]
            let ns = namespace.replace('/*', '');
            let path = typeof route === 'string' ? route : route[0];
            this.register(ns, path.replace('*', '{0}'));
            return;
        }
        if (typeof route === 'string') {
            if (path_isRelative(route)) {
                var location = path_getDir(path_resolveCurrent());
                if (path_isRelative(location)) {
                    location = '/' + location;
                }
                route = location + route;
            }
            if (route[0] === '/') {
                let base = path_resolveBase();
                route = path_combine(base, route);
            }
        }

        this.routes[namespace] = route instanceof Array
            ? route
            : route.split(/[\{\}]/g);
    }
    /**
     *    @param {String} template = Example: 'scroller/scroller.min?ui=black'
     */
    resolve(namespace: string, template: string): RouteInfo {
        var questionMark = template.indexOf('?'),
            aliasIndex = template.indexOf('::'),
            alias,
            query = '';

        if (aliasIndex !== -1) {
            alias = template.substring(aliasIndex + 2);
            template = template.substring(0, aliasIndex);
        }

        if (questionMark !== -1) {
            query = template.substring(questionMark);
            template = template.substring(0, questionMark);
        }

        let slugs  = template.split('/');
        let route = this.routes[namespace];

        if (route == null) {
            return {
                path: slugs.join('/') + query,
                params: null,
                alias: alias
            };
        }

        let path = route[0];

        for (let i = 1; i < route.length; i++) {
            if (i % 2 === 0) {
                path += route[i];
            } else {
                /** if template provides less "breadcrumbs" than needed -
                 * take always the last one for failed peaces */

                let index = parseFloat(route[i]);
                if (index > slugs.length - 1) {
                    index = slugs.length - 1;
                }

                path += slugs[index];

                if (i === route.length - 2) {
                    for (index++; index < slugs.length; index++) {
                        path += '/' + slugs[index];
                    }
                }
            }
        }
        return {
            path: path + query,
            params: null,
            alias: alias
        };
    }
    /**
     *    @arg includeData :
     *    1. string - URL to resource
     *    2. array - URLs to resources
     *    3. object - {route: x} - route defines the route template to resource,
     *        it must be set before in include.cfg.
     *        example:
     *            include.cfg('net','scripts/net/{name}.js')
     *            include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
     *    @arg namespace - route in case of resource url template, or namespace in case of LazyModule
     *
     *    @arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
     *    @arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
     */
    each(type: ResourceType, includeData: PackageArgument, fn: (a: string, b: RouteInfo, c: string) => void, namespace?: string, xpath?: string) {
        if (includeData == null) {
            return;
        }

        if (type === 'lazy' && xpath == null) {
            let obj = includeData as { [property: string]: string }
            for (let key in obj) {
                this.each(type, obj[key], fn, null, key);
            }
            return;
        }
        if (includeData instanceof Array) {
            for (var i = 0; i < includeData.length; i++) {
                this.each(type, includeData[i], fn, namespace, xpath);
            }
            return;
        }
        if (typeof includeData === 'object') {
            for (var key in includeData) {
                this.each(type, includeData[key], fn, key, xpath);
            }
            return;
        }
        if (typeof includeData === 'string') {
            var x = this.resolve(namespace, includeData);
            if (namespace) {
                namespace += '.' + includeData;
            }

            fn(namespace, x, xpath);
            return;
        }
        console.error('Include Package is invalid', arguments);
    }

    getRoutes() {
        return this.routes;
    }
    parseAlias(route) {
        var path = route.path,
            result = regexpAlias.exec(path);
        return result && result[1];
    }
}

export const Routes = new RoutesCtor();

export function RoutesLib() {

    return new RoutesCtor();
};

export interface RouteInfo {
    path: string
    params: any
    alias: string
}

const regexpAlias = /([^\\\/]+)\.\w+$/;
