import { refs } from '../global'
import { file_read, file_watch } from './utils/file';
import { cfg } from '../Config';
import { bin_removeDelegate } from '../Bin';
import { IPartialXMLHttpRequest } from '../interfaces/IPartialXMLHttpRequest';

refs.XMLHttpRequest = class NodeXMLHttpRequest implements IPartialXMLHttpRequest {

    url: string
    headers: any = {}
    status: number

    responseText: string
    readyState: number

    onreadystatechange: Function
    onerror: Function

    open(method, url) {
        this.url = url;
    }
    on(event, cb) {
        if (event === 'error') {
            this.onerror = cb;
            return;
        }
        console.warn('Not implemented event', event);
    }
    send() {
        let q = this.url.indexOf('?');
        if (q !== -1) {
            this.url = this.url.substring(0, q);
        }
        file_read(this.url,  (err, data) => {
            if (err) {
                this.status = 500;
                this.onerror?.(err);
                data = '';
            } else {
                this.status = 200;
            }
            this.readyState = 4;
            this.responseText = data;
            this.onreadystatechange();
            if (err == null && cfg.autoreload) {
                file_watch(this.url, bin_removeDelegate(this.url));
            }
        });
    }
    addEventListener(event, cb) {
        this.on(event, cb);
    }
    getAllResponseHeaders () {
        return this.headers;
    }

};
