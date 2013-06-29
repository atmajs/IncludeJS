
// source ../src/head.js
(function (root, factory) {
    'use strict';

	var _global, _exports, _document;
	
	if (typeof exports !== 'undefined' && (root === exports || root == null)){
		// raw nodejs module
    	_global = _exports = global;
    }
	
	if (_global == null) {
		_global = typeof window === 'undefined' ? global : window;
	}
	if (_exports == null) {
		_exports = root || _global;
	}
	
	_document = _global.document;
	
	
	factory(_global, _exports, _document);

}(this, function (global, exports, document) {
    'use strict';

	// source ../src/1.scope-vars.js
	
	/**
	 *	.cfg
	 *		: path :=	root path. @default current working path, im browser window.location;
	 *		: eval := in node.js this conf. is forced
	 *		: lockedToFolder := makes current url as root path
	 *			Example "/script/main.js" within this window.location "{domain}/apps/1.html"
	 *			will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
	 */
	
	var bin = {},
		isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
		reg_subFolder = /([^\/]+\/)?\.\.\//,
		cfg = {
			path: null,
			loader: null,
			version: null,
			lockedToFolder: null,
			sync: null,
			eval: document == null
		},
		handler = {},
		hasOwnProp = {}.hasOwnProperty,
		__array_slice = Array.prototype.slice,
		
		XMLHttpRequest = global.XMLHttpRequest;
	
		 
	// source ../src/2.Helper.js
	var Helper = { /** TODO: improve url handling*/
		
		reportError: function(e) {
			console.error('IncludeJS Error:', e, e.message, e.url);
			typeof handler.onerror === 'function' && handler.onerror(e);
		}
		
	},
	
		XHR = function(resource, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				xhr.readyState === 4 && callback && callback(resource, xhr.responseText);
			};
	
			xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
			xhr.send();
		};
	
	
	// source ../src/utils/fn.js
	function fn_proxy(fn, ctx) {
		
		return function(){
			fn.apply(ctx, arguments);
		};
		
	}
	
	function fn_doNothing(fn) {
		typeof fn === 'function' && fn();
	}
	// source ../src/utils/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function' ? arguments[i].prototype : arguments[i];
	
			for (key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}
	// source ../src/utils/array.js
	function arr_invoke(arr, args, ctx) {
	
		if (arr == null || arr instanceof Array === false) {
			return;
		}
	
		for (var i = 0, length = arr.length; i < length; i++) {
			if (typeof arr[i] !== 'function') {
				continue;
			}
			if (args == null) {
				arr[i].call(ctx);
			}else{
				arr[i].apply(ctx, args);
			}
		}
	
	}
	
	function arr_ensure(obj, xpath) {
		if (!xpath) {
			return obj;
		}
		var arr = xpath.split('.'),
			imax = arr.length - 1,
			i = 0,
			key;
	
		for (; i < imax; i++) {
			key = arr[i];
			obj = obj[key] || (obj[key] = {});
		}
	
		key = arr[imax];
		return obj[key] || (obj[key] = []);
	}
	// source ../src/utils/path.js
	function path_getDir(url) {
		var index = url.lastIndexOf('/');
		return index === -1 ? '' : url.substring(index + 1, -index);
	}
	
	// @TODO - implement url resolving of a top script
	function path_resolveCurrent() {
		if (document == null) {
			return '';
		}
		var scripts = document.getElementsByTagName('script'),
			last = scripts[scripts.length - 1],
			url = last && last.getAttribute('src') || '';
			
		return (url[0] === '/') ? url : '/' + url;
	}
	
	function path_resolveUrl(url, parent) {
		if (cfg.path && url[0] === '/') {
			url = cfg.path + url.substring(1);
		}
	
		switch (url.substring(0, 5)) {
			case 'file:':
			case 'http:':
				return url;
		}
	
		if (url.substring(0, 2) === './') {
			url = url.substring(2);
		}
	
	
		if (url[0] === '/') {
			if (isWeb === false || cfg.lockedToFolder === true) {
				url = url.substring(1);
			}
		} else if (parent != null && parent.location != null) {
			url = parent.location + url;
		}
	
	
		while (url.indexOf('../') !== -1) {
			url = url.replace(reg_subFolder, '');
		}
	
		return url;
	}
	
	function path_isRelative(path) {
		var c = path.charCodeAt(0);
		
		switch (c) {
			case 47:
				// /
				return false;
			case 102:
				// f
			case 104:
				// h
				return /^file:|https?:/.test(path) === false;
		}
		
		return true;
	}
	
	// source ../src/2.Routing.js
	var RoutesLib = function() {
	
		var routes = {},
			regexpAlias = /([^\\\/]+)\.\w+$/;
	
		
			
		return {
			/**
			 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
			 */
			register: function(namespace, route, currentInclude) {
				
				if (typeof route === 'string' && path_isRelative(route)) {
					var res = currentInclude || include,
						location = res.location || path_getDir(res.url || path_resolveCurrent());
						
					if (path_isRelative(location)) {
						location = '/' + location;
					}
					
					route = location + route;
				}
	
				routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);
	
			},
	
			/**
			 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
			 */
			resolve: function(namespace, template) {
				var questionMark = template.indexOf('?'),
					aliasIndex = template.indexOf('::'),
					alias, path, params, route, i, x, length, arr;
					
				
				if (aliasIndex !== -1){
					alias = template.substring(aliasIndex + 2);
					template = template.substring(0, aliasIndex);
				}
				
				if (questionMark !== -1) {
					arr = template.substring(questionMark + 1).split('&');
					params = {};
					
					for (i = 0, length = arr.length; i < length; i++) {
						x = arr[i].split('=');
						params[x[0]] = x[1];
					}
	
					template = template.substring(0, questionMark);
				}
	
				template = template.split('/');
				route = routes[namespace];
				
				if (route == null){
					return {
						path: template.join('/'),
						params: params,
						alias: alias
					};
				}
				
				path = route[0];
				
				for (i = 1; i < route.length; i++) {
					if (i % 2 === 0) {
						path += route[i];
					} else {
						/** if template provides less "breadcrumbs" than needed -
						 * take always the last one for failed peaces */
						
						var index = route[i] << 0;
						if (index > template.length - 1) {
							index = template.length - 1;
						}
						
						
						
						path += template[index];
						
						if (i === route.length - 2){
							for(index++; index < template.length; index++){
								path += '/' + template[index];
							}
						}
					}
				}
	
				return {
					path: path,
					params: params,
					alias: alias
				};
			},
	
			/**
			 *	@arg includeData :
			 *	1. string - URL to resource
			 *	2. array - URLs to resources
			 *	3. object - {route: x} - route defines the route template to resource,
			 *		it must be set before in include.cfg.
			 *		example:
			 *			include.cfg('net','scripts/net/{name}.js')
			 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
			 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
			 *
			 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
			 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
			 */
			each: function(type, includeData, fn, namespace, xpath) {
				var key;
	
				if (includeData == null) {
					console.error('Include Item has no Data', type, namespace);
					return;
				}
	
				if (type === 'lazy' && xpath == null) {
					for (key in includeData) {
						this.each(type, includeData[key], fn, null, key);
					}
					return;
				}
				if (includeData instanceof Array) {
					for (var i = 0; i < includeData.length; i++) {
						this.each(type, includeData[i], fn, namespace, xpath);
					}
					return;
				}
				if (typeof includeData === 'object') {
					for (key in includeData) {
						if (hasOwnProp.call(includeData, key)) {
							this.each(type, includeData[key], fn, key, xpath);
						}
					}
					return;
				}
	
				if (typeof includeData === 'string') {
					var x = this.resolve(namespace, includeData);
					if (namespace){
						namespace += '.' + includeData;
					}
					
					fn(namespace, x, xpath);
					return;
				}
				
				console.error('Include Package is invalid', arguments);
			},
	
			getRoutes: function(){
				return routes;
			},
			
			parseAlias: function(route){
				var path = route.path,
					result = regexpAlias.exec(path);
				
				return result && result[1];
			}
		};
		
	};
	
	var Routes = RoutesLib();
	
	
	/*{test}
	
	console.log(JSON.stringify(Routes.resolve(null,'scroller.js::Scroller')));
	
	Routes.register('lib', '.reference/libjs/{0}/lib/{1}.js');
	console.log(JSON.stringify(Routes.resolve('lib','scroller::Scroller')));
	console.log(JSON.stringify(Routes.resolve('lib','scroller/scroller.mobile?ui=black')));
	
	Routes.register('framework', '.reference/libjs/framework/{0}.js');
	console.log(JSON.stringify(Routes.resolve('framework','dom/jquery')));
	
	
	*/
	// source ../src/3.Events.js
	var Events = (function(document) {
		if (document == null) {
			return {
				ready: fn_doNothing,
				load: fn_doNothing
			};
		}
		var readycollection = [];
	
		function onReady() {
			Events.ready = fn_doNothing;
	
			if (readycollection == null) {
				return;
			}
	
			arr_invoke(readycollection);
			readycollection = null;
		}
	
		/** TODO: clean this */
	
		if ('onreadystatechange' in document) {
			document.onreadystatechange = function() {
				if (/complete|interactive/g.test(document.readyState) === false) {
					return;
				}
				onReady();
			};
		} else if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded', onReady);
		}else {
			window.onload = onReady;
		}
	
	
		return {
			ready: function(callback) {
				readycollection.unshift(callback);
			}
		};
	})(document);
	 
	// source ../src/4.IncludeDeferred.js
	
	/**
	 * STATES:
	 * 0: Resource Created
	 * 1: Loading
	 * 2: Loaded - Evaluating
	 * 3: Evaluated - Childs Loading
	 * 4: Childs Loaded - Completed
	 */
	
	var IncludeDeferred = function() {
		this.callbacks = [];
		this.state = 0;
	};
	
	IncludeDeferred.prototype = { /**	state observer */
	
		on: function(state, callback, sender) {
			// this === sender in case when script loads additional
			// resources and there are already parents listeners
			
			var mutator = (this.state < 3 || this === sender) ? 'unshift':'push';
			
			state <= this.state ? callback(this) : this.callbacks[mutator]({
				state: state,
				callback: callback
			});
			return this;
		},
		readystatechanged: function(state) {
	
			var i, length, x, currentInclude;
	
			if (state > this.state) {
				this.state = state;
			}
	
			if (this.state === 3) {
				var includes = this.includes;
	
				if (includes != null && includes.length) {
					for (i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
	
				this.state = 4;
			}
	
			i = 0;
			length = this.callbacks.length;
	
			if (length === 0){
				return;
			}
	
			//do not set asset resource to global
			if (this.type === 'js' && this.state === 4) {
				currentInclude = global.include;
				global.include = this;
			}
	
			for (; i < length; i++) {
				x = this.callbacks[i];
				if (x == null || x.state > this.state) {
					continue;
				}
	
				this.callbacks.splice(i,1);
				length--;
				i--;
	
				/* if (!DEBUG)
				try {
				*/
					x.callback(this);
				/* if (!DEBUG)
				} catch(error){
					console.error(error.toString(), 'file:', this.url);
				}
				*/
	
				if (this.state < 4){
					break;
				}
			}
	
			if (currentInclude != null){
				global.include = currentInclude;
			}
		},
	
		/** idefer */
	
		ready: function(callback) {
			var that = this;
			return this.on(4, function() {
				Events.ready(function(){
					that.resolve(callback);
				});
			}, this);
		},
	
		///////// Deprecated
		/////////** assest loaded and window is loaded */
		////////loaded: function(callback) {
		////////	return this.on(4, function() {
		////////		Events.load(callback);
		////////	});
		////////},
		/** assets loaded */
		done: function(callback) {
			var that = this;
			return this.on(4, function(){
				that.resolve(callback);
			}, this);
		},
		resolve: function(callback) {
			var includes = this.includes,
				length = includes == null ? 0 : includes.length;
	
			if (length > 0 && this.response == null){
				this.response = {};
	
				var resource, route;
	
				for(var i = 0, x; i < length; i++){
					x = includes[i];
					resource = x.resource;
					route = x.route;
	
					if (!resource.exports){
						continue;
					}
	
					var type = resource.type;
					switch (type) {
					case 'js':
					case 'load':
					case 'ajax':
	
						var alias = route.alias || Routes.parseAlias(route),
							obj = type === 'js' ? this.response : (this.response[type] || (this.response[type] = {}));
	
						if (alias) {
							obj[alias] = resource.exports;
							break;
						} else {
							console.warn('Resource Alias is Not defined', resource);
						}
						break;
					}
	
				}
			}
			callback(this.response);
		}
	};
	 
	// source ../src/5.Include.js
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
			instance: function(url) {
				var resource;
				resource = new Resource();
				resource.state = 4;
				
				if (url) {
					resource.location = path_getDir(url);
				}
				
				return resource;
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
			}
		});
	
		return Include;
	}());
	 
	// source ../src/6.ScriptStack.js
	/** @TODO Refactor loadBy* {combine logic} */
	
	var ScriptStack = (function() {
	
		var head, currentResource, stack = [],
			loadScript = function(url, callback) {
				//console.log('load script', url);
				var tag = document.createElement('script');
				tag.type = 'text/javascript';
				tag.src = url;
	
				if ('onreadystatechange' in tag) {
					tag.onreadystatechange = function() {
						(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
					};
				} else {
					tag.onload = tag.onerror = callback;
				}(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
			},
	
			loadByEmbedding = function() {
				if (stack.length === 0) {
					return;
				}
	
				if (currentResource != null) {
					return;
				}
	
				var resource = (currentResource = stack[0]);
	
				if (resource.state === 1) {
					return;
				}
	
				resource.state = 1;
	
				global.include = resource;
				global.iparams = resource.route.params;
	
	
				function resourceLoaded(e) {
	
	
					if (e && e.type === 'error') {
						console.log('Script Loaded Error', resource.url);
					}
	
					var i = 0,
						length = stack.length;
	
					for (; i < length; i++) {
						if (stack[i] === resource) {
							stack.splice(i, 1);
							break;
						}
					}
	
					if (i === length) {
						console.error('Loaded Resource not found in stack', resource);
						return;
					}
	
					resource.readystatechanged(3);
	
					currentResource = null;
					loadByEmbedding();
				}
	
				if (resource.source) {
					__eval(resource.source, resource);
	
					resourceLoaded();
					return;
				}
	
				loadScript(resource.url, resourceLoaded);
			},
			processByEval = function() {
				if (stack.length === 0) {
					return;
				}
				if (currentResource != null) {
					return;
				}
	
				var resource = stack[0];
	
				if (resource.state < 2) {
					return;
				}
	
				currentResource = resource;
	
				resource.state = 1;
				global.include = resource;
	
				//console.log('evaling', resource.url, stack.length);
				__eval(resource.source, resource);
	
				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];
					if (x === resource) {
						stack.splice(i, 1);
						break;
					}
				}
	
				resource.readystatechanged(3);
				currentResource = null;
				processByEval();
	
			};
	
	
		return {
			load: function(resource, parent, forceEmbed) {
	
				//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');
	
				var added = false;
				if (parent) {
					for (var i = 0, length = stack.length; i < length; i++) {
						if (stack[i] === parent) {
							stack.splice(i, 0, resource);
							added = true;
							break;
						}
					}
				}
	
				if (!added) {
					stack.push(resource);
				}
	
				// was already loaded, with custom loader for example
	
				if (!cfg.eval || forceEmbed) {
					loadByEmbedding();
					return;
				}
	
				if (cfg.sync === true) {
					currentResource = null;
				}
	
	
				if (resource.source) {
					resource.state = 2;
					processByEval();
					return;
				}
	
				XHR(resource, function(resource, response) {
					if (!response) {
						console.error('Not Loaded:', resource.url);
					}
	
					resource.source = response;
					resource.state = 2;
	
					processByEval();
				});
			},
			/* Move resource in stack close to parent */
			moveToParent: function(resource, parent) {
				var length = stack.length,
					parentIndex = -1,
					resourceIndex = -1,
					i;
	
				for (i = 0; i < length; i++) {
					if (stack[i] === resource) {
						resourceIndex = i;
						break;
					}
				}
	
				if (resourceIndex === -1) {
					// this should be not the case, but anyway checked.
					
					// - resource can load resources in done cb, and then it will be
					// already not in stack
					//-console.warn('Resource is not in stack', resource);
					return;
				}
	
				for (i= 0; i < length; i++) {
					if (stack[i] === parent) {
						parentIndex = i;
						break;
					}
				}
	
				if (parentIndex === -1) {
					//// - should be already in stack
					////if (parent == null) {
					////	stack.unshift(resource);
					////}
					return;
				}
	
				if (resourceIndex < parentIndex) {
					return;
				}
	
				stack.splice(resourceIndex, 1);
				stack.splice(parentIndex, 0, resource);
	
	
			}
		};
	})();
	
	// source ../src/7.CustomLoader.js
	var CustomLoader = (function() {
	
		// source loader/json.js
			
		var JSONParser = {
			process: function(source, res){
				try {
					return JSON.parse(source);
				} catch(error) {
					console.error(error, source);
					return null;
				}
			}
		};
		
		
	
		var _loaders = {
			'json': JSONParser
		};
	
		cfg.loader = {
			json : 1
		}
		
		function createLoader(url) {
			var extension = url.substring(url.lastIndexOf('.') + 1);
	
			if (_loaders.hasOwnProperty(extension)) {
				return _loaders[extension];
			}
	
			var loaderRoute = cfg.loader[extension],
				path = loaderRoute,
				namespace = null;
	
			if (typeof loaderRoute === 'object') {
				for (var key in loaderRoute) {
					namespace = key;
					path = loaderRoute[key];
					break;
				}
			}
	
			return (_loaders[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
		}
		
		function doLoad(resource, loader, callback) {
			XHR(resource, function(resource, response) {
				callback(resource, loader.process(response, resource));
			});
		}
	
		return {
			load: function(resource, callback) {
	
				var loader = createLoader(resource.url);
				
				if (loader.process) {
					doLoad(resource, loader, callback);
					return;
				}
				
				loader.done(function() {
					doLoad(resource, loader.exports, callback);
				});
			},
			exists: function(resource) {
				if (!(resource.url && cfg.loader)) {
					return false;
				}
	
				var url = resource.url,
					extension = url.substring(url.lastIndexOf('.') + 1);
	
				return cfg.loader.hasOwnProperty(extension);
			}
		};
	}());
	
	// source ../src/8.LazyModule.js
	var LazyModule = {
		create: function(xpath, code) {
			var arr = xpath.split('.'),
				obj = global,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			arr = null;
	
			Object.defineProperty(obj, module, {
				get: function() {
	
					delete obj[module];
					try {
						var r = __eval(code, global.include);
						if (!(r == null || r instanceof Resource)){
							obj[module] = r;
						}
					} catch (error) {
						error.xpath = xpath;
						Helper.reportError(error);
					} finally {
						code = null;
						xpath = null;
						return obj[module];
					}
				}
			});
		}
	};
	// source ../src/9.Resource.js
	var Resource = (function(Include, IncludeDeferred, Routes, ScriptStack, CustomLoader) {
	
		function process(resource) {
			var type = resource.type,
				parent = resource.parent,
				url = resource.url;
	
			if (CustomLoader.exists(resource) === false) {
				switch (type) {
					case 'js':
					case 'embed':
						ScriptStack.load(resource, parent, type === 'embed');
						break;
					case 'ajax':
					case 'load':
					case 'lazy':
						XHR(resource, onXHRCompleted);
						break;
					case 'css':
						resource.state = 4;
	
						var tag = document.createElement('link');
						tag.href = url;
						tag.rel = "stylesheet";
						tag.type = "text/css";
						document.getElementsByTagName('head')[0].appendChild(tag);
						break;
				}
			} else {
				CustomLoader.load(resource, onXHRCompleted);
			}
	
			return resource;
		}
	
		function onXHRCompleted(resource, response) {
			if (!response) {
				console.warn('Resource cannt be loaded', resource.url);
				resource.readystatechanged(4);
				return;
			}
	
			switch (resource.type) {
				case 'js':
				case 'embed':
					resource.source = response;
					ScriptStack.load(resource, resource.parent, resource.type === 'embed');
					return;
				case 'load':
				case 'ajax':
					resource.exports = response;
					break;
				case 'lazy':
					LazyModule.create(resource.xpath, response);
					break;
				case 'css':
					var tag = document.createElement('style');
					tag.type = "text/css";
					tag.innerHTML = response;
					document.getElementsByTagName('head')[0].appendChild(tag);
					break;
			}
	
			resource.readystatechanged(4);
		}
	
		var Resource = function(type, route, namespace, xpath, parent, id) {
			Include.call(this);
			IncludeDeferred.call(this);
	
			this.childLoaded = fn_proxy(this.childLoaded, this);
	
			var url = route && route.path;
	
			if (url != null) {
				this.url = url = path_resolveUrl(url, parent);
			}
	
			this.route = route;
			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;
			this.parent = parent;
	
			if (id == null && url) {
				id = (url[0] === '/' ? '' : '/') + url;
			}
	
	
			var resource = bin[type] && bin[type][id];
			if (resource) {
	
				if (resource.state < 4 && type === 'js') {
					ScriptStack.moveToParent(resource, parent);
				}
	
				return resource;
			}
	
			if (url == null) {
				this.state = 3;
				this.location = path_getDir(path_resolveCurrent());
				return this;
			}
	
	
			this.location = path_getDir(url);
	
	
	
			(bin[type] || (bin[type] = {}))[id] = this;
	
			if (cfg.version) {
				this.url += (this.url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			}
	
			return process(this);
	
		};
	
		Resource.prototype = obj_inherit(Resource, IncludeDeferred, Include, {
			childLoaded: function(child) {
				var resource = this,
					includes = resource.includes;
				if (includes && includes.length) {
					if (resource.state < 3 /* && resource.url != null */ ) {
						// resource still loading/include is in process, but one of sub resources are already done
						return;
					}
					for (var i = 0; i < includes.length; i++) {
						if (includes[i].resource.state !== 4) {
							return;
						}
					}
				}
				resource.readystatechanged(4);
			},
			create: function(type, route, namespace, xpath, id) {
				var resource;
	
				this.state = this.state >= 3 ? 3 : 2;
				this.response = null;
	
				if (this.includes == null) {
					this.includes = [];
				}
	
				resource = new Resource(type, route, namespace, xpath, this, id);
	
				this.includes.push({
					resource: resource,
					route: route
				});
	
				return resource;
			},
			include: function(type, pckg) {
				var that = this;
				Routes.each(type, pckg, function(namespace, route, xpath) {
	
					if (that.route != null && that.route.path === route.path) {
						// loading itself
						return;
					}
					
					that
						.create(type, route, namespace, xpath)
						.on(4, that.childLoaded);
	
				});
	
				return this;
			}
		});
	
		return Resource;
	
	}(Include, IncludeDeferred, Routes, ScriptStack, CustomLoader));
	
	// source ../src/10.export.js
	
	exports.include = new Include();
	
	exports.includeLib = {
		Routes: RoutesLib,
		Resource: Resource,
		ScriptStack: ScriptStack,
		registerLoader: CustomLoader.register
	};
	
	// source ../src/11.node.js
	(function() {
	
		var fs = require('fs'),
			vm = require('vm'),
			Module = module.constructor,
			globalPath,
			includePath;
	
	
		XMLHttpRequest = function() {};
		XMLHttpRequest.prototype = {
			constructor: XMLHttpRequest,
			open: function(method, url) {
				this.url = url;
			},
			send: function() {
	
				if (this.url.indexOf('file://') !== -1) {
					this.url = getFile(this.url);
				}
	
				if (cfg.sync === true) {
					try {
						this.readyState = 4;
						this.responseText = fs.readFileSync(this.url, 'utf8');
						this.onreadystatechange();
					} catch (err) {
						console.error('>>', err.path, err.toString());
					}
				} else {
					var that = this;
					fs.readFile(this.url, 'utf8', function(err, data) {
						if (err) {
							console.error('>>', err.code, err.path);
							data = '';
						}
						that.readyState = 4;
						that.responseText = data;
						that.onreadystatechange();
					});
				}
			}
		};
	
		__eval = function(source, include, isGlobalCntx) {
			module.exports = {};
			
			global.include = include;
			global.require = require;
			global.exports = module.exports;
			global.__filename = getFile(include.url);
			global.__dirname = getDir(global.__filename);
			global.module = module;
	
			if (isGlobalCntx !== true) {
				source = '(function(){ ' + source + ' }())';
			}
	
			try {
				vm.runInThisContext(source, global.__filename);
			} catch(e) {
				console.error('Module Evaluation Error', include.url);
				console.error(e.stack);
			}
			
			
			
			if (include.exports == null) {
				var exports = module.exports;
				
				if (typeof exports !== 'object' || Object.keys(exports).length) {
					include.exports = module.exports;
				}
			}
	
		};
	
	
		function getFile(url) {
			url = url.replace('file://', '').replace(/\\/g, '/');
			
			if (/^\/\w+:\/[^\/]/i.test(url)){
				// win32 drive
				return url.substring(1);
			}
			
			return url;
		}
	
		function getDir(url) {
			return url.substring(0, url.lastIndexOf('/'));
		}
	
	
		Resource.prototype.inject = function(pckg) {
				var current = this;
				
				current.state = current.state >= 3 ? 3 : 2;
				
				var bundle = current.create();
				
				bundle.url = this.url;
				bundle.location = this.location;
				bundle.load(pckg).done(function(resp){
		
					var sources = resp.load,
						key,
						resource;
					
					try {
						for(var i = 0; i< bundle.includes.length; i++){
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
		
					
					bundle.on(4, function(){
						
						current
							.includes
							.splice
							.apply(current.includes, [bundle, 1].concat(bundle.includes));
	
						current.readystatechanged(3);
					});
				});
		
				return current;
			};
	
	
		Resource.prototype.instance = function(currentUrl) {
			if (typeof currentUrl === 'string') {
	
				var old = module,
					next = new Module(currentUrl, old);
	
				next.filename = getFile(currentUrl);
				next.paths = Module._nodeModulePaths(getDir(next.filename));
	
	
				if (!globalPath) {
					var delimiter = process.platform === 'win32' ? ';' : ':',
						PATH = process.env.PATH || process.env.path;
	
					if (!PATH){
						console.error('PATH not defined in env', process.env);
					}
	
					var parts = PATH.split(delimiter),
						globalPath = ruqq.arr.first(parts, function(x){
							return /([\\\/]npm[\\\/])|([\\\/]npm$)/gi.test(x);
						});
	
					if (globalPath){
						globalPath = globalPath.replace(/\\/g, '/');
						globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';
		
						includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
					}else {
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
		};
	
	
	
	}());

}));

// source ../src/global-vars.js

function __eval(source, include) {
	"use strict";
	
	var iparams = include && include.route.params;

	/* if !DEBUG
	try {
	*/
		return eval.call(window, source);
	
	/* if !DEBUG
	} catch (error) {
		error.url = include && include.url;
		//Helper.reportError(error);
		console.error(error);
	}
	*/
	
}
