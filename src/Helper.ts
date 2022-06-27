import { cfg } from './Config'
import { isBrowser, handler, refs } from './global'
import { type Resource } from './Resource';
import { class_Dfr } from './utils/class_Dfr';

export const Helper = { /** TODO: improve url handling*/

    reportError(e) {
        console.error('IncludeJS Error:', e, e.message, e.url);
        handler.onerror && handler.onerror(e);
    },

    XHR(resource: string | Resource, callback) {
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
            if (typeof resource !== 'string') {
                resource.error = err;
            }
        });
        xhr.open('GET', url, async);
        xhr.send();
    },
    XHR_LOAD(url: string, callback?: (status: number, content?: string) => void): PromiseLike<TNetworkResponse> | null {
        let xhr = new refs.XMLHttpRequest();
        let dfr = callback == null
            ? new class_Dfr<TNetworkResponse>()
            : null;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }
            const body = xhr.responseText;
            const headers = xhr.getAllResponseHeaders();
            const status = xhr.status;

            if (status !== 200) {
                dfr?.resolve({
                    body,
                    status,
                    headers,
                });
                callback?.(status);
                return;
            }
            dfr?.resolve({
                body,
                status,
                headers,
            });
            callback?.(null, body);
        };

        xhr.open('GET', url, cfg.sync === true ? false : true);
        xhr.send();
        return dfr;
    }
};

interface TNetworkResponse<T = string> {
    status: number
    headers: any
    body?: T
}
