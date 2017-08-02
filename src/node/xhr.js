XMLHttpRequest = function() {};
XMLHttpRequest.prototype = {
    constructor: XMLHttpRequest,
    open: function(method, url) {
        this.url = url;
    },
    send: function() {

        if (this.url.indexOf('file://') !== -1) {
            this.url = path_getFile(this.url);
        } else if (this.url[0] === '/'){
            this.url = this.url.substring(1);
        }
        var q = this.url.indexOf('?');
        if (q !== -1) this.url = this.url.substring(0, q);

        var that = this;
        file_read(this.url, function(err, data) {
            if (err) {
                that.status = 500;
                data = '';
            } else {
                that.status = 200;
            }
            that.readyState = 4;
            that.responseText = data;
            that.onreadystatechange();
            if (err == null && cfg.autoreload) {
                file_watch(that.url, bin_removeDelegate(that.url));
            }
        });

    }
};