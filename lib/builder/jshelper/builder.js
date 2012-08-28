include.js({
    framework: ['arr', 'net/uri'],
    '': ['parser.js', 'uglify.js', '/csshelper/cssmin.js','/csshelper/cssparser.js'],    
}).done(function() {

    console.log('builder');

    var w = window,
        r = ruqq,
        include = {},
        cfg = {},
        appdir = '',
        helper = {
            resolveAppUri: function(url, current) {
                if (url[0] == '/') {
                    return url;

                }
                if (url.substring(0, 4) == 'file') return '/';

                var index = current.lastIndexOf('/');
                
                return (index == -1 ? '/' : (current.substring(index + 1, -index))) + url;
            },
            resolveUri: function(url, current) {
                if (url[0] == '/') return appdir + url.substring(1);
                if (url.substring(0, 4) == 'file') return url;

                if (current != null) {
                    return current + url;
                }


                return url;
            }
        };


    var Include = Class({
        Construct: function() {

            this.includes = {};
            r.arr.each(['js', 'css', 'load', 'lazy'], function(x) {
                this[x] = function(pckg) {
                    w.include.helper.eachIncludeItem(x, pckg, function(namespace, url) {

                        if (this.includes[x] == null) this.includes[x] = [];

                        if (this.location == null) {
                            this.location = w.include.helper.uri.getDir(this.url);
                        }

                        this.includes[x].push({
                            appuri: helper.resolveAppUri(url, this.appuri),
                            url: helper.resolveUri(url, this.location),
                            namespace: namespace
                        });
                    }.bind(this));
                    return this;
                }
            }.bind(this));

        },
        cfg: w.include.cfg,
        from: function(path) {
            this.currentPath = path;
            return this;
        }
    });


    window.Builder = (function(w) {

        return {
            process: function(type, url, minify) {
                console.log('Building solution... ', url);
                this.start = Date.now();

                solution = new Solution(type, url, this);
                solution.minify = minify;
                solution.process();
            },
            resolve: function(solution) {
                var script = solution.uri.combine('script');
                script.file = script.file.replace('.' + script.extension, '') + '.build.js';
                app.service('io', 'file/save', {
                    content: solution.output.js,
                    path: script.toLocalFile()
                });
                
                if (solution.output.css){
                    var style = solution.uri.combine('style');
                    style.file = style.file.replace('.' + style.extension, '') + '.build.css';
                    app.service('io', 'file/save', {
                        content: solution.output.css,
                        path: style.toLocalFile()
                    });
                }
                
                if (solution.output.html){
                    var html = solution.uri.combine('');
                    html.file = html.file.replace('.' + html.extension, '') + '.build.css';
                    app.service('io', 'file/save', {
                        content: solution.output.css,
                        path: html.toLocalFile()
                    });
                }
                

                console.log('Solution Done. Time: ', Date.now() - this.start);
            }
        }
    })(w);

    var Resource = Class({
        Base: Include,
        Construct: function(type, url, appuri, namespace, idfr) {
            this.type = type;
            this.namespace = namespace;
            this.url = url;
            this.appuri = appuri;

            this.idfr = idfr;
            this.includes = [];
            this.index = -1;

        },
        onload: function(source) {
            if (!source) {
                console.error('Page cannt be loaded', this.url);
                this.idfr.resolve(this);
                return;
            }
            this.source = source;

            switch (this.type) {
            case 'html':
                var includes = HtmlParser.parse(appdir, source);

                for (var i = 0; i < includes.length; i++) {
                    this.includes.push(new Resource(includes[i].type, includes[i].url, includes[i].appuri, '', this));
                }

                break;
            case 'js':
                var include = this,
                    script;

                if (this.url.indexOf('include.js') == -1) {
                    var script = JsParser.parse(source);
                    if (script) eval(script);
                }

                for (var key in include.includes) {
                    var collection = include.includes[key];
                    for (var i = 0; i < collection.length; i++) {

                        this.includes.push(new Resource(key, collection[i].url, collection[i].appuri, collection[i].namespace, this));
                    }
                }
                break;
            case 'css':
            case 'load':
            case 'lazy':
                this.idfr.resolve(this);
                return;
            default:
                throw new Error('Builder: resource of unknown type' + this.type);
                break;
            }

            this.process();
        },
        process: function() {
            if (this.source == null) {
                Zepto.get(this.url, this.onload.bind(this));
                return;
            }
            if (++this.index > this.includes.length - 1) {
                this.idfr.resolve(this);
                return;
            }
            this.includes[this.index].process();
        },
        resolve: function(resource) {
            this.process();
        }
    });


    var Solution = Class({
        Construct: function(type, url, idfr) {

            var index = url.lastIndexOf('/');
            appdir = index == -1 ? '' : url.substring(index + 1, -index);

            this.uri = new w.net.URI(url);
            this.resource = new Resource(type, url, '/', 'solution', this);
            this.idfr = idfr;
        },
        _buildStack: function(type, includes) {
            if (!includes && !includes.length) return null;
            var arr = [];
            for (var i = 0; i < includes.length; i++) {

                var resource = includes[i];
                var stack = this._buildStack(type, resource.includes);
                if (stack && stack.length) arr = arr.concat(stack);

                if (resource.type == type) arr.push(resource);
            }
            return arr;
        },
        _distinctStack: function(stack) {
            for (var i = 0; i < stack.length; i++) {
                for (var j = 0; j < i; j++) {
                    if (stack[i].url == stack[j].url) {
                        stack.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }
            return stack;
        },
        process: function() {
            this.resource.process();
            return this;
        },
        resolve: function(sender) {
            if (sender == this.resource) {

                var resources = {
                    js: '',
                    load: '',
                    lazy: '',
                    css: ''
                }

                var output = {},
                    bin = {},
                    includeIndex = -1;


                for (var key in resources) {
                    var stack = this._buildStack(key, this.resource.includes);
                    stack = this._distinctStack(stack);

                    for (var i = 0, resource; resource = stack[i], i < stack.length; i++) {
                        if (key == 'js' && resource.url.indexOf('include.js') > -1){
                            includeIndex = i;
                        }
                        var o = {},
                            t = resource.namespace ? 'namespace' : 'url';
                        o[t] = resource.namespace || resource.appuri;

                        (bin[key] || (bin[key] = [])).push(o);

                        
                        var source = key == 'load' || key == 'lazy' ? resource : resource.source;
                        (output[key] || (output[key] = [])).push(source);
                        
                        if (key == 'js' && includeIndex > -1 && i > includeIndex){
                            var header = 'var include = new IncludeResource(null, "'+ resource.url +'")';
                            output.js.splice(output.js.length - 1, 0, header);
                        }
                        
                        
                        if (key == 'css'){
                            var images = CssParser.parse(this.uri, new w.net.URI(resource.url), source);
                            if (images){
                                if (!output.images) output.images = [];
                                output.images = output.images.concat(images);
                            }
                            console.log('IMAGES', images);
                        }
                    }
                }

                if (output.js == null) output.js = [];
                
                var info = [];
                info.push('include.cfg(' + JSON.stringify(window.include.cfg()) + ')')
                info.push('include.register(' + JSON.stringify(bin) + ')');
                output.js.splice(++includeIndex, 0, info.join(';'));


                if (sender.type == 'js') output.js.push(sender.source);

                output.js = output.js.join(';\r\n');
                
                if (solution.minify) {
                    var ast = jsp.parse(output.js);
                    ast = pro.ast_mangle(ast);
                    //-ast = pro.ast_squeeze(ast); 
                    output.js = pro.gen_code(ast);
                }
                
                if (output.css) {
                    output.css = output.css.join('\r\n');
                    
                    if (solution.minify){
                        output.css = cssmin(output.css);
                    }
                }
                
                
                if (output.load || output.lazy) {
                    var stream = [];
                    for (var i = 0; output.load && i < output.load.length; i++) {
                        stream.push("<script type='include/load' data-appuri='");
                        stream.push(output.load[i].appuri);
                        stream.push("'>");
                        stream.push(output.load[i].source)
                        stream.push("</script>\r\n");
                    }
                    for (var i = 0; output.lazy && i < output.lazy.length; i++) {
                        stream.push("<script type='include/lazy' data-appuri='");
                        stream.push(output.lazy[i].appuri);
                        stream.push("'>");
                        stream.push(output.lazy[i].source)
                        stream.push("</script>\r\n");
                    }
                    output.xhr = stream.join('');
                }

                if (sender.type == 'html') HtmlParser.create(this, output);


                this.output = output;

                if (typeof ruqq !== 'undefined' && ruqq.events) {
                    ruqq.events.trigger('builder.done', output);
                }

                this.idfr.resolve(this);
            }
        }
    });

});