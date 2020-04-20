import { cfg } from '../Config';
import { global, document, isNode, isBrowser } from '../global';

const reg_hasProtocol = /^[\w\-]{2,}:\/\//i;

export function path_getDir(path) {
    return path.substring(0, path.lastIndexOf('/') + 1);
}

export function path_getFile(path) {
    path = path
        .replace('file://', '')
        .replace(/\\/g, '/')
        .replace(/\?[^\n]+$/, '');

    if (/^\/\w+:\/[^\/]/i.test(path)) {
        // win32 drive
        return path.substring(1);
    }
    return path;
}

export function path_getExtension(path) {
    var query = path.indexOf('?');
    if (query === -1) {
        return path.substring(path.lastIndexOf('.') + 1);
    }

    return path.substring(path.lastIndexOf('.', query) + 1, query);
}

export function path_resolveBase () {
    //#if (NODE)
    if (isNode) {
        return path_win32Normalize(process.cwd() + '/');
    }
    //#endif
    let doc = document as Document;
    let origin = document.location.origin;
    let path = cfg.base || '/';
    if (cfg.lockedToFolder) {
        path = doc.location.pathname;
    }
    return path_combine(origin, path, '/');
}

export function path_resolveCurrent() {
    if (document == null) {        
        return global.module == null ? '' : path_win32Normalize(process.cwd() + '/');
    }
    var scripts = document.getElementsByTagName('script'),
        last = scripts[scripts.length - 1],
        url = (last && last.getAttribute('src')) || '';

    if (url[0] === '/') {
        return url;
    }

    var location = window.location.pathname.replace(/\/[^\/]+\.\w+$/, '');

    if (location[location.length - 1] !== '/') {
        location += '/';
    }

    return location + url;
}

export function path_normalize(path) {
    var path_ = path
        .replace(/\\/g, '/')
        // remove double slashes, but not near protocol
        .replace(/([^:\/])\/{2,}/g, '$1/');
    // use triple slashes by file protocol
    if (/^file:\/\/[^\/]/.test(path_)) {
        path_ = path_.replace('file://', 'file:///');
    }
    return path_;
}

export function path_win32Normalize(path) {
    path = path_normalize(path);
    if (path.substring(0, 5) === 'file:') {
        return path;
    }
    return path_combine('file:///', path);
}

export function path_resolveUrl(url, parent) {
    url = path_normalize(url);
    if (reg_hasProtocol.test(url)) {
        return Path.collapse(url);
    }
    if (url.substring(0, 2) === './') {
        url = url.substring(2);
    }
    if (url[0] === '/' && parent != null && parent.base != null) {
        url = path_combine(parent.base, url);
        if (reg_hasProtocol.test(url)) {
            return Path.collapse(url);
        }
    }
    if (url[0] === '/' && cfg.path && url.indexOf(cfg.path) !== 0) {
        url = path_combine(cfg.path, url);
        if (reg_hasProtocol.test(url)) {
            return Path.collapse(url);
        }
    }
    if (url[0] !== '/') {
        if (parent != null && parent.location != null) {
            url = path_combine(parent.location, url);
        } else {
            let current = path_resolveCurrent();
            let dir = path_getDir(current);
            url = path_combine(dir, url);
        }
    }
    if (url[0] !== '/' && reg_hasProtocol.test(url) === false) {
        url = '/' + url;
    }
    return Path.collapse(url);
}

export function path_isRelative(path) {
    const c = path.charCodeAt(0);
    switch (c) {
        case 46: /* . */
            return true;
        case 47:
            // /
            return false;
    }
    return reg_hasProtocol.test(path) === false;
}

export function path_combine(...args) {
    var out = '',
        imax = args.length,
        i = -1,
        x;
    while (++i < imax) {
        x = args[i];
        if (!x) continue;

        x = path_normalize(x);

        if (out === '') {
            out = x;
            continue;
        }

        if (out[out.length - 1] !== '/') out += '/';

        if (x[0] === '/') x = x.substring(1);

        out += x;
    }

    return out;
}

namespace Path {
    const rgx_host = /^\w+:\/\/[^\/]+\//;
    const rgx_subFolder = /\/?([^\/]+\/)\.\.\//;
    const rgx_dottedFolder = /\/\.\.\//;


    export function collapse (url: string) {
        let host = rgx_host.exec(url);
        if (host) {
            url = url.replace(host[0], '');
        }
        let path = url;
        do {
            url = path;
            path = path.replace(rgx_subFolder, '/');
        } while (path !== url)

        //#if (BROWSER)
        if (isBrowser) {
            do {
                url = path;
                path = path.replace(rgx_dottedFolder, '/');
            } while (path !== url);
        }
        //#endif

        path = path.replace(/\/\.\//g, '/');

        if (host) {
            return host[0] + path;
        }
        return path;
    }

}
