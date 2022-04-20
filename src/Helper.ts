import { cfg } from './Config'
import { isBrowser, handler, refs } from './global'

export const Helper = { /** TODO: improve url handling*/

    reportError(e) {
        console.error('IncludeJS Error:', e, e.message, e.url);
        handler.onerror && handler.onerror(e);
    },

    XHR(resource, callback) {
        let xhr = new refs.XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback?.(resource, xhr.responseText);
            }
        };

        let url = typeof resource === 'object' ? resource.url : resource;
        let async = cfg.sync === true ? false : true;
        if (isBrowser && cfg.version) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
        }
        if (url[0] === '/' && cfg.lockedToFolder === true) {
            url = url.substring(1);
        }
        xhr.addEventListener('error', err => {
            resource.error = err;
        });
        xhr.open('GET', url, async);
        xhr.send();
    },
    XHR_LOAD(url, callback) {
        let xhr = new refs.XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                callback(xhr.status);
                return;
            }
            callback(null, xhr.responseText);
        };

        xhr.open('GET', url, cfg.sync === true ? false : true);
        xhr.send();
    }
};
