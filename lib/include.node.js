
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

// end:source ../src/head.js
	// import ../src/1.scope-vars.js 
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
	
	// end:source ../src/2.Helper.js
	
	// source ../src/utils/fn.js
	function fn_proxy(fn, ctx) {
		
		return function(){
			fn.apply(ctx, arguments);
		};
		
	}
	
	function fn_doNothing(fn) {
		typeof fn === 'function' && fn();
	}
	// end:source ../src/utils/fn.js
	// source ../src/utils/object.js
	function obj_inherit(target /* source, ..*/ ) {
		if (typeof target === 'function') {
			target = target.prototype;
		}
		var i = 1,
			imax = arguments.length,
			source, key;
		for (; i < imax; i++) {
	
			source = typeof arguments[i] === 'function'
				? arguments[i].prototype
				: arguments[i];
	
			for (key in source) {
				target[key] = source[key];
			}
		}
		return target;
	}
	// end:source ../src/utils/object.js
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
	// end:source ../src/utils/array.js
	// source ../src/utils/path.js
	function path_getDir(url) {
		var index = url.lastIndexOf('/');
		return index === -1 ? '' : url.substring(index + 1, -index);
	}
	
	function path_resolveCurrent() {
	
		if (document == null) {
			return typeof module === 'undefined'
				? '' 
				: path_win32Normalize(module.parent.filename);
		}
		var scripts = document.getElementsByTagName('script'),
			last = scripts[scripts.length - 1],
			url = last && last.getAttribute('src') || '';
			
		return (url[0] === '/') ? url : '/' + url;
	}
	
	function path_win32Normalize(path){
		path = path.replace(/\\/g, '/');
		if (path.substring(0, 5) === 'file:'){
			return path;
		}
	
		return 'file:///' + path;
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
	
	function path_getExtension(path) {
		var query = path.indexOf('?');
		if (query === -1) {
			return path.substring(path.lastIndexOf('.') + 1);
		}
		
		return path.substring(path.lastIndexOf('.', query) + 1, query);
	}
	// end:source ../src/utils/path.js
	
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
					alias,
					path,
					params,
					route,
					i,
					x,
					length,
					arr;
					
				
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
	// end:source ../src/2.Routing.js
	// import ../src/3.Events.js 
	// import ../src/4.IncludeDeferred.js 
	// import ../src/5.Include.js 
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
	
	// end:source ../src/6.ScriptStack.js
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
		
		
		// end:source loader/json.js
	
		cfg.loader = {
			json : JSONParser
		};
		
		function loader_isInstance(x) {
			if (typeof x === 'string')
				return false;
			
			return typeof x.ready === 'function' || typeof x.process === 'function';
		}
		
		function createLoader(url) {
			var extension = path_getExtension(url),
				loader = cfg.loader[extension];
	
			if (loader_isInstance(loader)) {
				return loader;
			}
	
			var path = loader,
				namespace;
	
			if (typeof path === 'object') {
				// is route {namespace: path}
				for (var key in path) {
					namespace = key;
					path = path[key];
					break;
				}
			}
	
			return (cfg.loader[extension] = new Resource('js', Routes.resolve(namespace, path), namespace));
		}
		
		function doLoad_completeDelegate(callback, resource) {
			return function(response){
				callback(resource, response);
			};
		}
		
		function doLoad(resource, loader, callback) {
			XHR(resource, function(resource, response) {
				var delegate = doLoad_completeDelegate(callback, resource),
					syncResponse = loader.process(response, resource, delegate);
				
				// match also null
				if (typeof syncResponse !== 'undefined') {
					callback(resource, syncResponse);
				}
				
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
				if (!resource.url) {
					return false;
				}
	
				var ext = path_getExtension(resource.url);
	
				return cfg.loader.hasOwnProperty(ext);
			},
			
			/**
			 *	IHandler:
			 *	{ process: function(content) { return _handler(content); }; }
			 *
			 *	Url:
			 *	 path to IHandler
			 */
			register: function(extension, handler){
				if (typeof handler === 'string'){
					var resource = include;
					if (resource.location == null) { 
						resource = {
							location: path_getDir(path_resolveCurrent())
						};
					}
	
					handler = path_resolveUrl(handler, resource);
				}
	
				cfg.loader[extension] = handler;
			}
		};
	}());
	
	// end:source ../src/7.CustomLoader.js
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
	// end:source ../src/8.LazyModule.js
	// source ../src/9.Resource.js
	var Resource = (function(Include, Routes, ScriptStack, CustomLoader) {
	
		function process(resource) {
			var type = resource.type,
				parent = resource.parent,
				url = resource.url;
				
			if (document == null && type === 'css') {
				resource.state = 4;
				
				return resource;
			}
	
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
				//- resource.readystatechanged(4);
				//- return;
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
	
			this.state = 0;
			this.location = path_getDir(url);
	
	
	
			(bin[type] || (bin[type] = {}))[id] = this;
	
			if (cfg.version) {
				this.url += (this.url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			}
	
			return process(this);
	
		};
	
		Resource.prototype = obj_inherit(Resource, Include, {
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
			},
			
			getNestedOfType: function(type){
				return resource_getChildren(this.includes, type);
			}
		});
	
		return Resource;
	
		
		function resource_getChildren(includes, type, out) {
			if (includes == null) {
				return null;
			}
			
			if (out == null) {
				out = [];
			}
			
			for (var i = 0, x, imax = includes.length; i < imax; i++){
				x = includes[i].resource;
				
				if (type === x.type) {
					out.push(x);
				}
				
				if (x.includes != null) {
					resource_getChildren(x.includes, type, out);
				}
			}
			
			return out;
		}
		
	}(Include, Routes, ScriptStack, CustomLoader));
	// end:source ../src/9.Resource.js
	
	// source ../src/10.export.js
	
	exports.include = new Include();
	
	exports.includeLib = {
		Routes: RoutesLib,
		Resource: Resource,
		ScriptStack: ScriptStack,
		registerLoader: CustomLoader.register
	};
	// end:source ../src/10.export.js
	
	// source ../src/11.node.js
	(function() {
	
		cfg.server = true;
	
		var fs = require('fs'),
			vm = require('vm'),
			Module = (global.module || module).constructor,
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
	
				var that = this;
				
				file_read(this.url, function(err, data) {
					if (err) {
						console.error('>>', err.code, err.path);
						data = '';
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
		
		function file_read(url, callback) {
			if (cfg.sync) {
				try {
					var content = fs.readFileSync(url, 'utf8');
					
					callback(null, content);
				} catch(error) {
					console.error('File Read - ', error);
				}
				
				return;
			}
			fs.readFile(url, 'utf8', callback);
		}
		
		var file_watch = (function(){
			var _watchers = {};
			
			function _unbind(path) {
				if (_watchers[path] == null)
					return;
				
				_watchers[path].close();
				_watchers[path] = null;
			}
			
			return function(path, callback){
				_unbind(path);
				_watchers[path] = fs.watch(path, callback);
			};
		}());
		
		
		function bin_removeDelegate(url) {
			// use timeout as sys-file-change event is called twice
			var timeout;
			return function(){
				if (timeout) 
					clearTimeout(timeout);
				
				timeout = setTimeout(function(){
					bin_remove(url);
				}, 150);
			};
		}
		function bin_remove(mix) {
			if (mix == null) 
				return;
			
			var type,
				id,
				index,
				res;
				
			var isUrl = typeof mix === 'string',
				url = isUrl ? mix : null;
			
			
			for (type in bin) {
				
				for (id in bin[type]) {
					
					if (isUrl === false) {
						if (bin[type][id] === mix) {
							delete bin[type][id];
							return;
						}
						continue;
					}
					
					index = id.indexOf(url);
					if (index !== -1 && index === id.length - url.length) {
						
						res = bin[type][id];
				
						delete bin[type][id];
						
						if (type === 'load') {
							bin_remove(res.parent);
						}
						
						return;
					}
				}
				
			}
			console.warn('[bin_remove] Resource is not in cache', url);
		}
	
		__eval = function(source, include, isGlobalCntx) {
			module.exports = {};
			
			global.include = include;
			global.require = require;
			global.exports = module.exports;
			global.__filename = getFile(include.url);
			global.__dirname = getDir(global.__filename);
			global.module = module;
	
			if (isGlobalCntx !== true) {
				source = '(function(){ ' + source + '\n}())';
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
			
			url = url
				.replace('file://', '')
				.replace(/\\/g, '/')
				.replace(/\?[^\n]+$/, '');
			
			if (/^\/\w+:\/[^\/]/i.test(url)){
				// win32 drive
				return url.substring(1);
			}
			
			return url;
		}
	
		function getDir(url) {
			return url.substring(0, url.lastIndexOf('/'));
		}
		
		obj_inherit(Resource, {
			
			path_getFile: function(){
				return getFile(this.url);
			},
			
			path_getDir: function(){
				return getDir(getFile(this.url));
			},
		
			inject: function() {
				
				var pckg = arguments.length === 1
					? arguments[0]
					: __array_slice.call(arguments);
				
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
			},
		
			instance: function(currentUrl) {
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
			}
		});
	
	
	
	}());
	// end:source ../src/11.node.js

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
// end:source ../src/global-vars.js
