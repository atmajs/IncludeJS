import { refs } from '../global'
import { path_getFile } from '../utils/path';
import { file_read, file_watch } from './utils/file';
import { cfg } from '../Config';
import { bin_removeDelegate } from '../Bin';

refs.XMLHttpRequest = class XMLHttpRequest {
    url: string
    status: number
    responseText: string
    readyState: number

    onreadystatechange: Function

    open(method, url) {
        this.url = url;
    }
    send() {

        if (this.url.indexOf('file://') !== -1) {
            this.url = path_getFile(this.url);
        } else if (this.url[0] === '/') {
            this.url = this.url.substring(1);
        }
        var q = this.url.indexOf('?');
        if (q !== -1) this.url = this.url.substring(0, q);

        
        file_read(this.url,  (err, data) => {
            if (err) {
                this.status = 500;
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
};