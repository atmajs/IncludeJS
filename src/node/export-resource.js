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

        var pckg = arguments.length === 1 ? arguments[0] : __array_slice.call(arguments);

        var current = this;

        current.state = current.state >= 3 ? 3 : 2;

        var bundle = current.create();

        bundle.url = this.url;
        bundle.location = this.location;
        bundle.load(pckg)
            .done(function(resp) {

            var sources = resp.load,
                key,
                resource;

            try {
                for (var i = 0; i < bundle.includes.length; i++) {
                    //@TODO - refactor

                    var resource = bundle.includes[i].resource,
                        source = resource.exports;


                    resource.exports = null;
                    resource.type = 'js';
                    resource.includes = null;
                    resource.state = 3;


                    for (var key in bin.load) {
                        if (bin.load[key] === resource) {
                            delete bin.load[key];
                            break;
                        }
                    }


                    __eval(source, resource, true);


                    resource.readystatechanged(3);

                }
            } catch (e) {
                console.error('Injected Script Error\n', e, key);
            }


            bundle.on(4, function() {

                current
                    .includes
                    .splice
                    .apply(current.includes, [bundle, 1].concat(bundle.includes));

                current.readystatechanged(3);
            });
        });

        return current;
    },

    instance: function(currentUrl) {
        if (typeof currentUrl === 'string') {

            var old = module,
                next = new Module(currentUrl, old);

            next.filename = path_getFile(currentUrl);
            next.paths = Module._nodeModulePaths(path_getDir(next.filename));


            if (!globalPath) {
                var delimiter = process.platform === 'win32' ? ';' : ':',
                    PATH = process.env.PATH || process.env.path;

                if (!PATH) {
                    console.error('PATH not defined in env', process.env);
                }

                var parts = PATH.split(delimiter),
                    globalPath = ruqq.arr.first(parts, function(x) {
                        return /([\\\/]npm[\\\/])|([\\\/]npm$)/gi.test(x);
                    });

                if (globalPath) {
                    globalPath = globalPath.replace(/\\/g, '/');
                    globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';

                    includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
                } else {
                    console.error('Could not resolve global NPM Directory from system path');
                    console.log('searched with pattern /npm in', PATH, delimiter);
                }
            }


            next.paths.unshift(includePath);
            next.paths.unshift(globalPath);

            module = next;
            require = next.require.bind(next);
        }

        var res = new Resource();
        res.state = 4;
        return res;
    }
});