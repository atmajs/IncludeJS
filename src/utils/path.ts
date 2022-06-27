import { cfg } from '../Config';
import { global, document, isNode, isBrowser } from '../global';

const reg_hasProtocol = /^[\w\-]{2,}:\/\//i;
const reg_hasExt = /\.(?<extension>[\w]{1,})($|\?|#)/;

export function path_getDir(path: string) {
    return path.substring(0, path.lastIndexOf('/') + 1);
}

export function path_cdUp(dirpath: string) {
    return dirpath.replace(/[^\/]+\/?$/, '');
}

export function path_getFile(path: string) {
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

export function path_hasExtension(path: string) {
    return reg_hasExt.test(path);
}

export function path_getExtension(path: string) {
    let match = reg_hasExt.exec(path);
    return match?.groups?.extension;
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
    if (!cfg.base && cfg.lockedToFolder) {
        path = doc.location.pathname;
        if (/\.[a-z]{1,5}$/i.test(path)) {
            path = path.replace(/[^\\/]+$/i, '');
        }
    }
    return path_combine(origin, path, '/');
}

export function path_resolveCurrent() {
    if (document == null) {
        return global.module == null ? '' : path_win32Normalize(process.cwd() + '/');
    }
    let scripts = document.getElementsByTagName('script');
    let last = scripts[scripts.length - 1];
    let url = (last && last.getAttribute('src')) || '';

    if (url[0] === '/') {
        return url;
    }

    let location = window.location.pathname.replace(/\/[^\/]+\.\w+$/, '');
    if (location[location.length - 1] !== '/') {
        location += '/';
    }

    return location + url;
}

export function path_normalize(path) {
    let path_ = path
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
export function path_toLocalFile(path: string) {
    //#if (NODE)
    if (isNode) {
        if (path.startsWith('file:')) {
            path = path.replace(/^file:\/+/, '');
            if (/^\w{1,3}:/.test(path) === false) {
                path = '/' + path;
            }
            return path;
        }
        return path_combine(process.cwd(), path);
    }
    //#endif
    return path;
}

export function path_resolveUrl(url: string, parent?: { base?: string, location?: string }) {
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
    let out = '';
    let imax = args.length;
    let i = -1;
    while (++i < imax) {
        let x = args[i];
        if (!x) {
            continue;
        }

        x = path_normalize(x);

        if (out === '') {
            out = x;
            continue;
        }
        if (out[out.length - 1] !== '/') {
            out += '/';
        }
        if (x[0] === '/') {
            x = x.substring(1);
        }
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
