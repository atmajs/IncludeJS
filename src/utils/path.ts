import { cfg } from '../Config';
import { global } from '../global';

const reg_subFolder = /([^\/]+\/)?\.\.\//;
const reg_hasProtocol = /^(file|https?):/i;

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

export function path_resolveCurrent() {
    if (document == null) {
        return global.module == null ? '' : path_win32Normalize(global.module.parent.filename);
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
    if (path.substring(0, 5) === 'file:') return path;

    return 'file:///' + path;
}

export function path_resolveUrl(url, parent) {
    if (reg_hasProtocol.test(url)) {
        return path_collapse(url);
    }
    if (url.substring(0, 2) === './') {
        url = url.substring(2);
    }
    if (url[0] === '/' && parent != null && parent.base != null) {
        url = path_combine(parent.base, url);
        if (reg_hasProtocol.test(url)) {
            return path_collapse(url);
        }
    }
    if (url[0] === '/' && cfg.path && url.indexOf(cfg.path) !== 0) {
        url = path_combine(cfg.path, url);
        if (reg_hasProtocol.test(url)) {
            return path_collapse(url);
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
    return path_collapse(url);
}

export function path_isRelative(path) {
    var c = path.charCodeAt(0);

    switch (c) {
        case 47:
            // /
            return false;
        case 102:
        // f
        case 104:
            // h
            return reg_hasProtocol.test(path) === false;
    }

    return true;
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

function path_collapse(url) {
    while (url.indexOf('../') !== -1) {
        url = url.replace(reg_subFolder, '');
    }

    return url.replace(/\/\.\//g, '/');
}
