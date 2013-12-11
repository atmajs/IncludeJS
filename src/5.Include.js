var Include = (function(IncludeDeferred) {

	function Include() {
		IncludeDeferred.call(this);
	}

	stub_release(Include.prototype);
	
	obj_inherit(Include, IncludeDeferred, {
		
		isBrowser: true,
		isNode: false,
		
		setCurrent: function(data) {

			var resource = new Resource('js', {
				path: data.id
			}, data.namespace, null, null, data.id);

			if (resource.state < 3) {
				console.error("<include> Resource should be loaded", data);
			}

			/**@TODO - probably state shoulb be changed to 2 at this place */
			resource.state = 3;
			global.include = resource;

		},
		
		cfg: function(arg) {
			switch (typeof arg) {
			case 'object':
				var key, value;
				for (key in arg) {
					value = arg[key];

					switch(key){
						case 'loader':
							for(var x in value){
								CustomLoader.register(x, value[x]);
							}
							break;
						case 'modules':
							if (value === true){
								enableModules();
							}
							break;
						default:
							cfg[key] = value;
							break;
					}

				}
				break;
			case 'string':
				if (arguments.length === 1) {
					return cfg[arg];
				}
				if (arguments.length === 2) {
					cfg[arg] = arguments[1];
				}
				break;
			case 'undefined':
				return cfg;
			}
			return this;
		},
		routes: function(mix) {
			if (mix == null) {
				return Routes.getRoutes();
			}
			
			if (arguments.length === 2) {
				Routes.register(mix, arguments[1]);
				return this;
			}
			
			for (var key in mix) {
				Routes.register(key, mix[key]);
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
		register: function(_bin) {
			
			var key,
				info,
				infos,
				imax,
				i;
			
			for (key in _bin) {
				infos = _bin[key];
				imax = infos.length;
				i = -1;
				
				while ( ++i < imax ) {
					
					info = infos[i];
					
					var id = info.id,
						url = info.url,
						namespace = info.namespace,
						parent = info.parent && incl_getResource(info.parent, 'js'),
						resource = new Resource(),
						state = info.state
						;
					
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
							CustomLoader.load(resource, function(resource, response){
								
								resource.exports = response;
								resource.readystatechanged(4);
							});
						}
						break;
					}
					
					//
					(bin[key] || (bin[key] = {}))[id] = resource;
				}
			}
		},
		/**
		 *	Create new Resource Instance,
		 *	as sometimes it is necessary to call include. on new empty context
		 */
		instance: function(url) {
			var resource;
			if (url == null) {
				resource = new Include();
				resource.state = 4;
				
				return resource;
			}
			
			resource = new Resource();
			resource.state = 4;
			resource.location = path_getDir(url);
			
			return resource;
		},

		getResource: incl_getResource,
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
			
			this._use = tree_resolveUsage(this, arguments);
			
			return this;
		},
		
		pauseStack: fn_proxy(ScriptStack.pause, ScriptStack),
		resumeStack: fn_proxy(ScriptStack.resume, ScriptStack),
		
		allDone: ScriptStack.complete
	});
	
	
	return Include;

	
	// >> FUNCTIONS
	
	function incl_getResource(url, type) {
		var id = url;
		
		if (url.charCodeAt(0) !== 47) {
			// /
			id = '/' + id;
		}

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
			doNothing;
	}
	
	function stub_release(proto) {
		var fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy'],
			i = fns.length;
		while (--i !== -1){
			proto[fns[i]] = createIncluder(fns[i]);
		}
		
		proto['inject'] = proto.js;
	}
	
}(IncludeDeferred));
