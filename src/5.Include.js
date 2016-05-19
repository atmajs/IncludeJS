var Include,
	IncludeLib = {};
(function(IncludeDeferred) {

	Include = function() {
		IncludeDeferred.call(this);
	};

	stub_release(Include.prototype);

	obj_inherit(Include, IncludeDeferred, {
		// Array: exports
		_use: null,

		// Array: names
		_usage: null,

		isBrowser: isBrowser,
		isNode: isNode,

		setCurrent: function(data) {
			var url = data.url,
				resource = this.getResourceById(url, 'js');

			if (resource == null) {
				if (url[0] === '/' && this.base)
					url = this.base + url.substring(1);

				var resource = new Resource(
					'js'
					, { path: url }
					, data.namespace
					, null
					, null
					, url);
			}
			if (resource.state < 3) {
				console.error("<include> Resource should be loaded", data);
			}

			/**@TODO - probably state shoulb be changed to 2 at this place */
			resource.state = 3;
			global.include = resource;
		},

		cfg: function(a, b) {
			return cfg.call(this, a, b);
		},
		routes: function(mix) {
			if (mix == null) {
				return Routes.getRoutes();
			}

			if (arguments.length === 2) {
				Routes.register(mix, arguments[1], this);
				return this;
			}

			for (var key in mix) {
				Routes.register(key, mix[key], this);
			}
			return this;
		},
		promise: function(namespace) {
			var arr = namespace.split('.'),
				obj = global;
			while (arr.length) {
				var key = arr.shift();
				obj = obj[key] || (obj[key] = {});
			}
			return obj;
		},
		/** @TODO - `id` property seems to be unsed and always equal to `url` */
		register: function(_bin) {

			var base = this.base,
				key,
				info,
				infos,
				imax,
				i;

			function transform(info){
				if (base == null)
					return info;
				if (info.url[0] === '/')
					info.url = base + info.url.substring(1);

				if (info.parent[0] === '/')
					info.parent = base + info.parent.substring(1);

				info.id = info.url;
				return info;
			}

			for (key in _bin) {
				infos = _bin[key];
				imax = infos.length;
				i = -1;

				while ( ++i < imax ) {

					info = transform(infos[i]);

					var id = info.id,
						url = info.url,
						namespace = info.namespace,
						parent = info.parent && incl_getResource(info.parent, 'js'),
						resource = new Resource(),
						state = info.state
						;
					if (! (id || url))
						continue;

					if (url) {
						if (url[0] === '/') {
							url = url.substring(1);
						}
						resource.location = path_getDir(url);
					}


					resource.state = state == null
						? (key === 'js' ? 3 : 4)
						: state
						;
					resource.namespace = namespace;
					resource.type = key;
					resource.url = url || id;
					resource.parent = parent;
					resource.base = parent && parent.base || base;

					switch (key) {
					case 'load':
					case 'lazy':
						var container = document.querySelector('#includejs-' + id.replace(/\W/g, ''));
						if (container == null) {
							console.error('"%s" Data was not embedded into html', id);
							break;
						}
						resource.exports = container.innerHTML;
						if (CustomLoader.exists(resource)){

							resource.state = 3;
							CustomLoader.load(resource, CustomLoader_onComplete);
						}
						break;
					}

					//
					(bin[key] || (bin[key] = {}))[id] = resource;
				}
			}
			function CustomLoader_onComplete(resource, response) {
				resource.exports = response;
				resource.readystatechanged(4);
			}
		},
		/**
		 *	Create new Resource Instance,
		 *	as sometimes it is necessary to call include. on new empty context
		 */
		instance: function(url, parent) {
			var resource;
			if (url == null) {
				resource = new Include();
				resource.state = 4;
				return resource;
			}
			resource = new Resource('js');
			resource.state = 4;
			resource.url = path_resolveUrl(url, parent);
			resource.location = path_getDir(resource.url);
			resource.parent = parent;
			return resource;
		},

		getResource: function(url, type){
			if (this.base && url[0] === '/')
				url = this.base + url.substring(1);

			return incl_getResource(url, type)
		},
		getResourceById: function(url, type){
			var _bin = bin[type],
				_res = _bin[url];
			if (_res != null)
				return _res;

			if (this.base && url[0] === '/') {
				_res = _bin[path_combine(this.base, url)];
				if (_res != null)
					return _res;
			}
			if (this.base && this.location) {
				_res = _bin[path_combine(this.base, this.location, url)];
				if (_res != null)
					return _res;
			}
			if (this.location) {
				_res = _bin[path_combine(this.location, url)];
				if (_res != null)
					return _res;
			}
			return null;
		},
		getResources: function(){
			return bin;
		},

		plugin: function(pckg, callback) {

			var urls = [],
				length = 0,
				j = 0,
				i = 0,
				onload = function(url, response) {
					j++;

					embedPlugin(response);

					if (j === length - 1 && callback) {
						callback();
						callback = null;
					}
				};
			Routes.each('', pckg, function(namespace, route) {
				urls.push(route.path[0] === '/' ? route.path.substring(1) : route.path);
			});

			length = urls.length;

			for (; i < length; i++) {
				XHR(urls[i], onload);
			}
			return this;
		},

		client: function(){
			if (cfg.server === true)
				stub_freeze(this);

			return this;
		},

		server: function(){
			if (cfg.server !== true)
				stub_freeze(this);

			return this;
		},

		use: function(){
			if (this.parent == null) {
				console.error('<include.use> Parent resource is undefined');
				return this;
			}

			this._usage = arguments;
			return this;
		},

		pauseStack: fn_proxy(ScriptStack.pause, ScriptStack),
		resumeStack: fn_proxy(ScriptStack.resume, ScriptStack),

		allDone: function(callback){
			ScriptStack.complete(function(){

				var pending = include.getPending(),
					await = pending.length;
				if (await === 0) {
					callback();
					return;
				}

				var i = -1,
					imax = await;
				while( ++i < imax ){
					pending[i].on(4, check, null, 'push');
				}

				function check() {
					if (--await < 1)
						callback();
				}
			});
		},

		getPending: function(type){
			var resources = [],
				res, key, id;

			for(key in bin){
				if (type != null && type !== key)
					continue;

				for (id in bin[key]){
					res = bin[key][id];
					if (res.state < 4)
						resources.push(res);
				}
			}

			return resources;
		},
		Lib: IncludeLib
	});


	// >> FUNCTIONS

	function incl_getResource(url, type) {
		var id = url;

		if (path_isRelative(url) === true)
			id = '/' + id;

		if (type != null){
			return bin[type][id];
		}

		for (var key in bin) {
			if (bin[key].hasOwnProperty(id)) {
				return bin[key][id];
			}
		}
		return null;
	}


	function embedPlugin(source) {
		eval(source);
	}

	function enableModules() {
		if (typeof Object.defineProperty === 'undefined'){
			console.warn('Browser do not support Object.defineProperty');
			return;
		}
		Object.defineProperty(global, 'module', {
			get: function() {
				return global.include;
			}
		});

		Object.defineProperty(global, 'exports', {
			get: function() {
				var current = global.include;
				return (current.exports || (current.exports = {}));
			},
			set: function(exports) {
				global.include.exports = exports;
			}
		});
	}

	function includePackage(resource, type, mix){
		var pckg = mix.length === 1 ? mix[0] : __array_slice.call(mix);

		if (resource instanceof Resource) {
			return resource.include(type, pckg);
		}
		return new Resource('js').include(type, pckg);
	}

	function createIncluder(type) {
		return function(){
			return includePackage(this, type, arguments);
		};
	}

	function doNothing() {
		return this;
	}

	function stub_freeze(include) {
		include.js =
		include.css =
		include.load =
		include.ajax =
		include.embed =
		include.lazy =
		include.inject =
		include.mask =
			doNothing;
	}

	function stub_release(proto) {
		var fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy', 'mask'],
			i = fns.length;
		while (--i !== -1){
			proto[fns[i]] = createIncluder(fns[i]);
		}

		proto['inject'] = proto.js;
	}

}(IncludeDeferred));
