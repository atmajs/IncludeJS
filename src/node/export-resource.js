(function(){

    var npmPath,
        atmaPath
        ;

    obj_inherit(Resource, {

        isBrowser: false,
        isNode: true,

        bin_remove: bin_remove,
        bin_tryReload: bin_tryReload,
        path_getFile: function() {
            return path_getFile(this.url);
        },

        path_getDir: function() {
            return path_getDir(path_getFile(this.url));
        },

        inject: function() {

            var pckg = arguments.length === 1
                ? arguments[0]
                : __array_slice.call(arguments);

            this.state = this.state >= 3 ? 3 : 2;

            var current = this,
                bundle = current.create()
                ;

            bundle.url = this.url;
            bundle.location = this.location;

            bundle
                .load(pckg)
                .done(function(resp) {

                bundle.state = 3;
                bundle.on(4, function() {

                    var remove = 1;
                    var index = ruqq.arr.indexOf(current.includes, function(res){
                        return res.resource === bundle;
                    });
                    if (index === -1){
                        index = current.includes.length - 1;
                        remove = 0;
                    }

                    current
                        .includes
                        .splice
                        .apply(current.includes, [index, remove].concat(bundle.includes));

                    current.readystatechanged(3);
                });

                inject_process(bundle, 0);
            });

            return current;
        },

        embed: function(){
            return this.js.apply(this, arguments);
        },

        instance: function(currentUrl, parent) {
            if (typeof currentUrl === 'string') {

                var old = module,
                    next = new Module(currentUrl, old);

                next.filename = path_getFile(currentUrl);
                next.paths = Module._nodeModulePaths(path_getDir(next.filename));


                if (npmPath == null) {

                    var PATH = process.env.PATH || process.env.path,
                        delimiter = require('path').delimiter,
                        parts = PATH.split(delimiter);

                    var i = parts.length,
                        rgx = /([\\\/]npm[\\\/])|([\\\/]npm$)/gi;
                    while ( --i > -1 ){
                        if (rgx.test(parts[i])) {
                            npmPath = parts[i];
                            break;
                        }
                    }

                    if (npmPath == null && process.platform !== 'win32') {
                        [
                            '/usr/lib/node_modules',
                            '/usr/local/lib/node_modules'
                        ].forEach(function(path){

                            if (npmPath == null && fs_exists(path))
                                npmPath = path;
                        });
                    }

                    if (npmPath) {
                        if (npmPath.indexOf('node_modules') === -1)
                            npmPath = path_combine(npmPath, 'node_modules');

                        atmaPath = path_combine(
                            path_getDir(
                                path_normalize(
                                    process.mainModule.filename
                            )), 'node_modules'
                        );
                    } else {
                        npmPath = false;
                        console.warn(
                            'Could not resolve global NPM Directory from system path (%s)',
                            delimiter,
                            PATH
                        );
                    }
                }


                if (atmaPath)
                    next.paths.unshift(atmaPath);

                if (npmPath)
                    next.paths.unshift(npmPath);


                global.module = module = next;

                var req = next.require.bind(next);
                if (__includeRequire == null) {
					global.require = require = req;
				} else {
                    __nativeRequire = req;
                }

            }

            var resource;
			if (currentUrl == null) {
				resource = new Include();
				resource.state = 4;
				return resource;
			}
			resource = new Resource('js');
			resource.state = 4;
			resource.url = path_resolveUrl(currentUrl, parent);
			resource.location = path_getDir(resource.url);
			resource.parent = parent;
			return resource;
        }
    });


    function inject_process(bundle, index){
        if (index >= bundle.includes.length)
            return bundle.readystatechanged(4);

        var include = bundle.includes[index],
            resource = include.resource,
            alias = include.route.alias,
            source = resource.exports
            ;

        resource.exports = null;
        resource.type = 'js';
        resource.includes = null;
        resource.state = 3;
        resource.parent = null;

        for (var key in bin.load) {
            if (bin.load[key] === resource) {
                delete bin.load[key];
                break;
            }
        }

        try {
            __eval(source, resource, true);
        } catch(error) {
            console.error('<inject> Evaluation error', resource.url, error);
            resource.state = 4;
        }

        resource.readystatechanged(3);
        resource.on(4, function(){

            if (resource.exports && alias) {
                global[alias] = resource.exports;
            }

            inject_process(bundle, ++index);
        });
    }
}());