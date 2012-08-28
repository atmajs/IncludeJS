;
(function(w) {
    'use strict';

    var helper = {
        isURI: function(o){
            return typeof o === 'object' && typeof o.combine === 'function';
        },
        combinePathes: function() {
            var args = arguments;
            var str = '';
            for (var i = 0; i < args.length; i++) {
                if (!args[i]) continue;
                if (!str) {
                    str = args[i];
                    continue;
                }
                if (str[str.length - 1] != '/') str += '/';
                str += args[i][0] == '/' ? args[i].substring(1) : args[i];
            }
            return str;
        },
        parseProtocol: function(o){            
            var value = /^([a-zA-Z]+):\/(\/)?/.exec(o.value); // @ 'c:/file.txt'| 'protocol://host.com'
            
            if (value == null) return;
            if (value[2] == null){
                o.protocol = 'file';
                return;
            }            
            o.protocol = value[1];
            if (value[0] == null || !o.value || !o.value.substring){
                console.log('IS NULL', o);
            }
            o.value = o.value.substring(value[0].length);
        },
        parseHost: function(o){
            if (o.protocol == null) return;
            var i = o.value.indexOf('/', 2);
            if (~i){
                o.host = o.value.substring(0, i);
            }else{
                o.host = o.value;
            }
            o.value = o.value.replace(o.host,'');
            
            if (o.protocol === 'file' && o.host[0] == '/'){
                o.host = o.host.substring(1);
            }
        },
        parseSearch: function(o){
            var i = o.value.indexOf('?');
            if (~i) {
                o.search = o.value.substring(i);
                o.value = o.value.replace(o.search, '');
            }
        },
        parseFile: function(o){
            var value = /\/?([^\/]+\.[^\/]+)$/i.exec(o.value); 
            var file = value ? value[1] : null;
            if (file) {
                o.file = file;
                o.value = o.value.replace(file, '');
                
                if (o.value[o.value.length - 1] == '/') {
                    o.value = o.value.substring(0, o.value.length - 1);
                }
                value = /\.(\w+)$/i.exec(o.file);
                o.extension = value ? value[1] : null;
            }
        }
    }

    if (w.net == null) w.net = {};
    w.net.URI = function(uri) {
        if (uri == null) return this;
        if (helper.isURI(uri)) return uri.combine('');
        

        this.value = uri;
        helper.parseProtocol(this);
        helper.parseHost(this);
        
        helper.parseSearch(this);
        helper.parseFile(this);
        
        this.path = this.value;
        return this;      
    }
    w.net.URI.combine = helper.combinePathes;

    w.net.URI.prototype = {
        cdUp: function() {
            if (!this.path || this.path == '/') return this;
            if (this.protocol == 'file' && /^\/?[a-zA-Z]+:\/?$/.test(this.path)) return this;
            this.path = this.path.replace(/\/?[^\/]+\/?$/i, '');
            return this;
        },
        /**
         * '/path' - relative to host
         * '../path', 'path','./path' - relative to current path
         */
        combine: function(path) {
            if (helper.isURI(path)) path = path.toString();

            var uri = new net.URI();
            for (var key in this) {
                if (typeof this[key] === 'string') {
                    uri[key] = this[key];
                }
            }
            
            if (!path) return uri;
            
            if (this.protocol == 'file' && path[0] == '/') path = path.substring(1);
            
            uri.value = path;
            helper.parseSearch(uri);
            helper.parseFile(uri);
            
            if (uri.value) {
                path = uri.value.replace(/^\.\//i, '');
                
                if (path[0] == '/') {
                    uri.path = path;
                    return uri;
                }
                while (/^(\.\.\/?)/ig.test(path)) {
                    uri.cdUp();
                    path = path.substring(3);
                }
                
                uri.path = helper.combinePathes(uri.path, path);
            }
            return uri;
        },
        toString: function() {
            console.log('tostring', this);
            
            var str = this.host ? this.protocol + '://' : '';
            if (this.protocol === 'file') str += '/';
            
            return str + helper.combinePathes(this.host, this.path, this.file) + (this.search || '');
        },
        /**
         * @return Current URI Path{String} that is relative to @arg1 URI
         */
        toRelativeString: function(uri) {
            if (typeof uri === 'string') uri = new w.net.URI(uri);
            if (uri.protocol != this.protocol || uri.host != this.host) return this.toString();

            if (this.path.indexOf(uri.path) == 0) { /** host folder */
                var p = this.path ? this.path.replace(uri.path, '') : '';
                if (p[0] === '/') p = p.substring(1);
                return helper.combinePathes(p, this.file) + (this.search || '');
            }

            /** sub folder */
            var current = this.path.split('/');
            var relative = uri.path.split('/');
            var commonpath = '';
            var i = 0,
                length = Math.min(current.length, relative.length);
            for (; i < length; i++) {
                if (current[i] == relative[i]) continue;
                break;
            }
            if (i > 0) {
                commonpath = current.splice(0, i).join('/');
            }
            if (commonpath) {
                var sub = '',
                    path = uri.path,
                    forward;
                while (path) {
                    if (this.path.indexOf(path) == 0) {
                        forward = this.path.replace(path, '');
                        break;
                    }
                    path = path.replace(/\/?[^\/]+\/?$/i, '');
                    sub += '../';
                }
                return helper.combinePathes(sub, forward, this.file);
            }


            return this.toString();
        },

        toLocalFile: function() {
            if (this.protocol !== 'file') return '';
            return helper.combinePathes(this.host, this.path, this.file);
        },
        toLocalDir: function() {
            if (this.protocol !== 'file') return '';
            return helper.combinePathes(this.host, this.path, '/');
        },
        isRelative: function() {
            return !this.host;
        }
    }

    w.net.URI.combinePathes = helper.combinePathes;
})(window);