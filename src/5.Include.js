var Include = (function() {

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

	function Include() {}

	
	var fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy'],
		i = 0,
		imax = fns.length,
		proto = Include.prototype;
	for (; i < imax; i++){
		proto[fns[i]] = createIncluder(fns[i]);
	}
	
	proto['inject'] = proto.js;
	
	
	obj_inherit(Include, {
		setCurrent: function(data) {

			var resource = new Resource('js', {
				path: data.id
			}, data.namespace, null, null, data.id);

			if (resource.state !== 4) {
				console.error("Current Resource should be loaded");
			}

			/**@TODO - probably state shoulb be changed to 2 at this place */
			resource.state = 3;
			global.include = resource;

		},
		
		cfg: function(arg) {
			switch (typeof arg) {
			case 'object':
				for (var key in arg) {
					cfg[key] = arg[key];

					if (key === 'modules' && arg[key] === true) {
						enableModules();
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
			for (var key in _bin) {
				for (var i = 0; i < _bin[key].length; i++) {
					var id = _bin[key][i].id,
						url = _bin[key][i].url,
						namespace = _bin[key][i].namespace,
						resource = new Resource();

					resource.state = 4;
					resource.namespace = namespace;
					resource.type = key;

					if (url) {
						if (url[0] === '/') {
							url = url.substring(1);
						}
						resource.location = path_getDir(url);
					}

					switch (key) {
					case 'load':
					case 'lazy':
						var container = document.querySelector('#includejs-' + id.replace(/\W/g, ''));
						if (container == null) {
							console.error('"%s" Data was not embedded into html', id);
							return;
						}
						resource.exports = container.innerHTML;
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
		instance: function() {
			return new Resource();
		},

		getResource: function(url, type) {
			var id = (url[0] === '/' ? '' : '/') + url;

			if (type != null){
				return bin[type][id];
			}

			for (var key in bin) {
				if (bin[key].hasOwnProperty(id)) {
					return bin[key][id];
				}
			}
			return null;
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
		}
	});

	return Include;
}());
