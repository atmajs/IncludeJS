
// source ../src/head.js
(function (root, factory) {
    'use strict';

	var _global, _exports;

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

	if (typeof include !== 'undefined' && typeof include.js === 'function') {
		// allow only one `include` per application
		_exports.include = include;
		_exports.includeLib = include.Lib || _global.includeLib;
		return;
	}

	factory(_global, _exports, _global.document);

}(this, function (global, exports, document) {
    'use strict';

// end:source ../src/head.js
	// source ../src/1.scope-vars.js
	var isWeb = !! (typeof location !== 'undefined' && location.protocol && /^https?:/.test(location.protocol)),
		reg_subFolder = /([^\/]+\/)?\.\.\//,
		reg_hasProtocol = /^(file|https?):/i,
		handler = {},
		hasOwnProp = {}.hasOwnProperty,
		emptyResponse = {
			load: {}
		},
		__array_slice = Array.prototype.slice,
	
		XMLHttpRequest = global.XMLHttpRequest;
	
	
	
	//#if (NODE)
	var isBrowser = false, isNode = true;
	//#endif
	
	// end:source ../src/1.scope-vars.js
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
	
			var url = typeof resource === 'object' ? resource.url : resource;
			var async = cfg.sync === true ? false : true;
			if (isBrowser && cfg.version) {
				url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
			}
			if (url[0] === '/' && cfg.lockedToFolder === true) {
				url = url.substring(1);
			}
			xhr.open('GET', url, async);
			xhr.send();
		},
		XHR_LOAD = function (url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState !== 4) {
					return;
				}
				if (xhr.status !== 200) {
					callback(xhr.status);
					return;
				}
				callback(null, xhr.responseText);
			};
	
			xhr.open('GET', url, cfg.sync === true ? false : true);
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
	var obj_inherit,
		obj_getProperty,
		obj_setProperty
		;
	
	(function(){
	
		obj_inherit = function(target /* source, ..*/ ) {
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
		};
		
		obj_getProperty = function(obj, property) {
			var chain = property.split('.'),
				length = chain.length,
				i = 0;
			for (; i < length; i++) {
				if (obj == null) 
					return null;
				
				obj = obj[chain[i]];
			}
			return obj;
		};
		
		obj_setProperty = function(obj, property, value) {
			var chain = property.split('.'),
				imax = chain.length - 1,
				i = -1,
				key;
			while ( ++i < imax ) {
				key = chain[i];
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
			obj[chain[i]] = value;
		};
		
	}());
	
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
	var path_getDir,
		path_getFile,
		path_getExtension,
		path_resolveCurrent,
		path_normalize,
		path_win32Normalize,
		path_resolveUrl,
		path_combine,
		path_isRelative
		;
	
	(function(){
	
	
		path_getDir = function(path) {
			return path.substring(0, path.lastIndexOf('/') + 1);
		};
	
		path_getFile = function(path) {
			path = path
				.replace('file://', '')
				.replace(/\\/g, '/')
				.replace(/\?[^\n]+$/, '');
	
			if (/^\/\w+:\/[^\/]/i.test(path)){
				// win32 drive
				return path.substring(1);
			}
			return path;
		};
	
		path_getExtension = function(path) {
			var query = path.indexOf('?');
			if (query === -1) {
				return path.substring(path.lastIndexOf('.') + 1);
			}
	
			return path.substring(path.lastIndexOf('.', query) + 1, query);
		};
	
		path_resolveCurrent = function() {
	
			if (document == null) {
				return typeof module === 'undefined'
					? ''
					: path_win32Normalize(module.parent.filename);
			}
			var scripts = document.getElementsByTagName('script'),
				last = scripts[scripts.length - 1],
				url = last && last.getAttribute('src') || '';
	
			if (url[0] === '/') {
				return url;
			}
	
			var location = window
				.location
				.pathname
				.replace(/\/[^\/]+\.\w+$/, '');
	
			if (location[location.length - 1] !== '/') {
				location += '/';
			}
	
			return location + url;
		};
	
		path_normalize = function(path) {
			var path_ = path
				.replace(/\\/g, '/')
				// remove double slashes, but not near protocol
				.replace(/([^:\/])\/{2,}/g, '$1/')
				;
			// use triple slashes by file protocol
			if (/^file:\/\/[^\/]/.test(path_)) {
				path_ = path_.replace('file://', 'file:///');
			}
			return path_;
		};
	
		path_win32Normalize = function(path){
			path = path_normalize(path);
			if (path.substring(0, 5) === 'file:')
				return path;
	
			return 'file:///' + path;
		};
	
		path_resolveUrl = function(url, parent) {
	
			if (reg_hasProtocol.test(url)) {
				return path_collapse(url);
			}
			if (url.substring(0, 2) === './') {
				url = url.substring(2);
			}
			if (url[0] === '/' && parent != null && parent.base != null) {
				url = path_combine(parent.base, url);
				if (reg_hasProtocol.test(url)) {
					return path_collapse(url);
				}
			}
			if (url[0] === '/' && cfg.path && url.indexOf(cfg.path) !== 0) {
				url = path_combine(cfg.path, url);
				if (reg_hasProtocol.test(url)) {
					return path_collapse(url);
				}
			}
			if (url[0] !== '/' && parent != null && parent.location != null) {
				url = path_combine(parent.location, url);
			}
			if (url[0] !== '/' && reg_hasProtocol.test(url) === false) {
				url = '/' + url;
			}
			return path_collapse(url);
		};
	
		path_isRelative = function(path) {
			var c = path.charCodeAt(0);
	
			switch (c) {
				case 47:
					// /
					return false;
				case 102:
					// f
				case 104:
					// h
					return reg_hasProtocol.test(path) === false;
			}
	
			return true;
		};
	
		path_combine = function() {
			var out = '',
				imax = arguments.length,
				i = -1,
				x
				;
			while ( ++i < imax ){
				x = arguments[i];
				if (!x)
					continue;
	
				x = path_normalize(x);
	
				if (out === '') {
					out = x;
					continue;
				}
	
				if (out[out.length - 1] !== '/')
					out += '/'
	
				if (x[0] === '/')
					x = x.substring(1);
	
				out += x;
			}
	
			return out;
		};
	
		function path_collapse(url) {
			while (url.indexOf('../') !== -1) {
				url = url.replace(reg_subFolder, '');
			}
	
			return url.replace(/\/\.\//g, '/');
		}
	
	}());
	
	// end:source ../src/utils/path.js
	// source ../src/utils/tree.js
	var tree_resolveUsage;
	
	
	(function(){
		
		tree_resolveUsage = function(resource, usage, next){
			var use = [],
				imax = usage.length,
				i = -1,
				
				obj, path, name, index, parent
				;
			while( ++i < imax ) {
				
				name = path = usage[i];
				index = path.indexOf('.');
				if ( index !== -1) {
					name = path.substring(0, index);
					path = path.substring(index + 1);
				}
				
				parent = use_resolveParent(name, resource.parent, resource);
				if (parent == null) 
					return null;
				
				if (parent.state !== 4){
					resource.state = 3;
					parent.on(4, next, parent, 'push');
					return null;
				}
				
				obj = parent.exports;
				
				if (name !== path) 
					obj = obj_getProperty(obj, path);
				
				// if DEBUG
				(typeof obj === 'object' && obj == null)
					&& console.warn('<include:use> Used resource has no exports', name, resource.url);
				// endif
				
				use[i] = obj;
			}
			return use;
		};
		
		
		function use_resolveParent(name, resource, initiator){
			
			if (resource == null) {
				// if DEBUG
				console.warn('<include> Usage Not Found:', name);
				console.warn('- Ensure to have it included before with the correct alias')
				console.warn('- Initiator Stacktrace:');
				
				var arr = [], res = initiator;
				while(res != null){
					arr.push(res.url);
					res = res.parent;
				}
				console.warn(arr.join('\n'));
				// endif
				
				return null;
			}
			
			
			var includes = resource.includes,
				i = -1,
				imax = includes.length,
				
				include, exports, alias
				;
				
			while( ++i < imax ) {
				include = includes[i];
				alias = include.route.alias || Routes.parseAlias(include.route);
				if (alias === name) 
					return include.resource;
			}
			
			return use_resolveParent(name, resource.parent, initiator);
		}
		
		
	}());
	// end:source ../src/utils/tree.js
	// source ../src/utils/res.js
	var res_groupByType;
	(function(){
		res_groupByType = function(arr){
			var pckg = {}, imax = arr.length, i = -1;
			while (++i < imax) {
				var path = arr[i];
				var ext = getExt(path);
				var type = getType(ext);
				append(pckg, type, path);
			}
			return pckg;
		};
	
		var rgxExt = /\.([\w]+)($|\?|:)/
		function getExt(path) {
			var match = rgxExt.exec(path);
			if (match == null) {
				return 'js';
			}
			return match[1];
		}
		function getType (ext) {
			return _types[ext] || 'load';
		}
		function append(pckg, type, path) {
			var arr = pckg[type];
			if (arr == null) {
				arr = pckg[type] = [];
			}
			arr.push(path);
		}
		var _types = {
			'js': 'js',
			'es6': 'js',
			'css': 'css',
			'less': 'css',
			'sass': 'css',
			'json': 'ajax',
			'mask': 'mask',
		};
	}());
	// end:source ../src/utils/res.js

	// source ../src/Config.js
	var cfg,
		Config;
	(function(){
	
		/**
		 *	path = root path. @default current working path, im browser window.location;
		 *	eval = in node.js this conf. is forced
		 *	lockedToFolder = makes current url as root path
		 *		Example "/script/main.js" within this window.location "{domain}/apps/1.html"
		 *		will become "{domain}/apps/script/main.js" instead of "{domain}/script/main.js"
		*/
	
		Config = function() {};
		Config.prototype = {
	
			path: null,
			loader: null,
			version: null,
			lockedToFolder: false,
			sync: false,
			eval: document == null,
			es6Exports: false,
	
			call: function(ctx, a, b){
				if (a == null) {
					return this;
				}
				var aType = typeof a;
				var bType = typeof b;
				if (aType === 'string' && b == null) {
					return this[a];
				}
				if (aType === 'string' && b != null) {
					set(this, a, b);
					return ctx;
				}
				if (aType === 'object' && b == null) {
					for (var key in a) {
						set(this, key, a[key]);
					}
				}
				return ctx;
			},
		};
	
		function set(cfg, key, value) {
			switch(key){
				case 'loader':
					for(var x in value){
						CustomLoader.register(x, value[x]);
					}
					return;
				case 'modules':
					if (value === true) enableModules();
					return;
				case 'commonjs':
					if (value === true) CommonJS.enable();
					return;
				case 'amd':
					if (value === true) Amd.enable();
					return;
				case 'map':
					PathResolver.configMap(value);
					return;
				case 'extentionDefault':
					PathResolver.configExt({ def: value });
					return;
				case 'extentionTypes':
					PathResolver.configExt({ types: value });
					return;
			}
			if ((key in cfg) === false) {
				console.warn('Not supported config', key);
			}
			cfg[key] = value;
		}
	
		cfg = new Config;
	
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
	
	}());
	// end:source ../src/Config.js
	// source ../src/Bin.js
	var bin,
		Bin;
	(function(){
	
		Bin = {
			add: function(type, id_, resource) {
				var id = normalizeId(id_);
				bin[type][id] = resource;
				bin.all[id] = resource;
			},
			get: function(type, id_) {
				if (id_ == null) {
					return;
				}
				var id = normalizeId(id_);
				var x = bin[type][id];
				if (x == null && /^https?:\//.test(id) && typeof location !== 'undefined') {
					id = id.replace(location.origin, '');
					x = bin[type][id] || bin.all[id];
				}
				if (x == null && cfg.lockedToFolder) {
					var path = path_getDir(location.pathname);
					var sub = path_combine('/', id.replace(path, ''));
					x = bin[type][sub] || bin.all[sub];
				}
				if (x == null && isBrowser && id[0] === '/') {
					var path = path_combine(global.location.origin, id);
					x = bin[type][path] || bin.all[path];
				}
				return x || bin.all[id];
			}
		};
	
		bin = {
			js: {},
			css: {},
			load: {},
			ajax: {},
			embed: {},
			mask: {},
	
			all: {},
		};
	
	
		function normalizeId(id_) {
			var id = id_;
			var q = id.indexOf('?');
			if (q !== -1)
				id = id.substring(0, q);
	
			return id.toLowerCase();
		}
	}());
	// end:source ../src/Bin.js
	// source ../src/2.Routing.js
	var Routes,
		RoutesLib;
	(function(){
	
		RoutesLib = RoutesLibFactory;
		Routes = RoutesLibFactory();
	
		function RoutesLibFactory() {
	
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
					routes[namespace] = route instanceof Array
						? route
						: route.split(/[\{\}]/g);
				},
				/**
				 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
				 */
				resolve: function(namespace, template) {
					var questionMark = template.indexOf('?'),
						aliasIndex = template.indexOf('::'),
						alias,
						path,
						query = '',
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
						query = template.substring(questionMark);					
						template = template.substring(0, questionMark);
					}
	
					template = template.split('/');
					route = routes[namespace];
	
					if (route == null){
						return {
							path: template.join('/') + query,
							params: null,
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
						path: path + query,
						params: null,
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
					if (includeData == null) {
						return;
					}
	
					if (type === 'lazy' && xpath == null) {
						for (var key in includeData) {
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
						for (var key in includeData) {
							this.each(type, includeData[key], fn, key, xpath);
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
	}());
	
	/*{test}
	
	console.log(JSON.stringify(Routes.resolve(null,'scroller.js::Scroller')));
	
	Routes.register('lib', '.reference/libjs/{0}/lib/{1}.js');
	console.log(JSON.stringify(Routes.resolve('lib','scroller::Scroller')));
	console.log(JSON.stringify(Routes.resolve('lib','scroller/scroller.mobile?ui=black')));
	
	Routes.register('framework', '.reference/libjs/framework/{0}.js');
	console.log(JSON.stringify(Routes.resolve('framework','dom/jquery')));
	
	
	*/
	// end:source ../src/2.Routing.js
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
	
	// end:source ../src/3.Events.js
    // source ../src/6.ScriptStack.js
    /** @TODO Refactor loadBy* {combine logic} */
    
    var ScriptStack = (function() {
    
    	var head,
    		currentResource,
    		stack = [],
    
    		_cb_complete = [],
    		_paused;
    
    
    	function loadScript(url, callback) {
    		if (cfg.version) {
    			url += (url.indexOf('?') === -1 ? '?' : '&') + 'v=' + cfg.version;
    		}
    		if (url[0] === '/' && cfg.lockedToFolder === true) {
    			url = url.substring(1);
    		}
    
    		var tag = document.createElement('script');
    		tag.type = 'text/javascript';
    		tag.src = url;
    
    		if ('onreadystatechange' in tag) {
    			tag.onreadystatechange = function() {
    				(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
    			};
    		} else {
    			tag.onload = tag.onerror = callback;
    		}
    		if (head == null) {
    			head = document.getElementsByTagName('head')[0];
    		}
    		head.appendChild(tag);
    	}
    
    	function loadByEmbedding() {
    		if (_paused) {
    			return;
    		}
    
    		if (stack.length === 0){
    			trigger_complete();
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
    
    			if (resource.state !== 2.5)
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
    	}
    
    	function processByEval() {
    		if (_paused) {
    			return;
    		}
    		if (stack.length === 0){
    			trigger_complete();
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
    		currentResource.state = 1;
    		global.include = resource;
    
    		__eval(resource.source, resource);
    
    		stackRemove(resource);
    
    		if (resource.state !== 2.5) {
    			resource.readystatechanged(3);
    		}
    		currentResource = null;
    		processByEval();
    	}
    
    	function processByEvalSync() {
    		if (_paused) {
    			return;
    		}
    		if (stack.length === 0){
    			trigger_complete();
    			return;
    		}
    
    		var resource = stack.shift();
    		if (resource.state < 2) {
    			return;
    		}
    
    		currentResource = resource;
    		currentResource.state = 3;
    		global.include = resource;
    
    		__eval(resource.source, resource);
    		resource.readystatechanged(3);
    
    		currentResource = null;
    		processByEvalSync();
    	}
    
    	function stackRemove(resource) {
    		var imax = stack.length,
    			i = -1;
    		while (++i < imax) {
    			if (stack[i] === resource) {
    				stack.splice(i, 1);
    				return;
    			}
    		}
    	}
    
    
    	function trigger_complete() {
    		var i = -1,
    			imax = _cb_complete.length;
    		while (++i < imax) {
    			_cb_complete[i]();
    		}
    
    		_cb_complete.length = 0;
    	}
    
    	return {
    		load: function(resource, parent, forceEmbed) {
    
    			this.add(resource, parent);
    
    			if (!cfg.eval || forceEmbed) {
    				loadByEmbedding();
    				return;
    			}
    
    			// was already loaded, with custom loader for example
    			if (resource.source) {
    				resource.state = 2;
    				processByEval();
    				return;
    			}
    
    			XHR(resource, function(resource, response) {
    				if (!response) {
    					console.error('Not Loaded:', resource.url);
    					console.error('- Initiator:', resource.parent && resource.parent.url || '<root resource>');
    				}
    
    				resource.source = response;
    				resource.state = 2;
    
    				if (cfg.sync) {
    					processByEvalSync();
    					return;
    				}
    				processByEval();
    			});
    		},
    
    		add: function(resource, parent) {
    			
    			if (resource.priority === 1)
    				return stack.unshift(resource);
    
    
    			if (parent == null)
    				return stack.push(resource);
    
    
    			var imax = stack.length,
    				i = -1
    				;
    			// move close to parent
    			while( ++i < imax){
    				if (stack[i] === parent)
    					return stack.splice(i, 0, resource);
    			}
    
    			// was still not added
    			stack.push(resource);
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
    				return;
    			}
    
    			for (i= 0; i < length; i++) {
    				if (stack[i] === parent) {
    					parentIndex = i;
    					break;
    				}
    			}
    
    			if (parentIndex === -1) {
    				return;
    			}
    
    			if (resourceIndex < parentIndex) {
    				return;
    			}
    
    			stack.splice(resourceIndex, 1);
    			stack.splice(parentIndex, 0, resource);
    
    
    		},
    
    		pause: function(){
    			_paused = true;
    		},
    
    		resume: function(){
    			_paused = false;
    
    			if (currentResource != null)
    				return;
    
    			this.touch();
    		},
    
    		touch: function(){
    			var fn = cfg.eval
    				? processByEval
    				: loadByEmbedding
    				;
    			fn();
    		},
    
    		complete: function(callback){
    			if (_paused !== true && stack.length === 0) {
    				callback();
    				return;
    			}
    
    			_cb_complete.push(callback);
    		}
    	};
    })();
    
    // end:source ../src/6.ScriptStack.js

	// source ../src/4.IncludeDeferred.js
	
	/**
	 * STATES:
	 * 0: Resource Created
	 * 1: Loading
	 * 2: Loaded - Evaluating
	 * 2.5: Paused - Evaluating paused
	 * 3: Evaluated - Childs Loading
	 * 4: Childs Loaded - Completed
	 */
	
	var IncludeDeferred = function() {
		this.callbacks = [];
		this.state = -1;
	};
	
	IncludeDeferred.prototype = { /**	state observer */
	
		on: function(state, callback, sender, mutator) {
			if (this === sender && this.state === -1) {
				callback(this);
				return this;
			}
	
			// this === sender in case when script loads additional
			// resources and there are already parents listeners
	
			if (mutator == null) {
				mutator = (this.state < 3 || this === sender)
					? 'unshift'
					: 'push'
					;
			}
	
			state <= this.state ? callback(this) : this.callbacks[mutator]({
				state: state,
				callback: callback
			});
			return this;
		},
		hasPendingChildren: function() {
			var arr = this.includes;
			if (arr == null) {
				return false;
			}
			var imax = arr.length,
				i = -1;
			while (++i < imax) {
				if (arr[i].resource.state !== 4) {
					return true;
				}
			}
			return false;
		},
		readystatechanged: function(state) {
	
			if (this.state < state) {
				this.state = state;
			}
	
			if (this.state === 3) {
				if (this.hasPendingChildren()) {
					return;
				}
				this.state = 4;
			}
			
			var currentState = this.state,
				cbs = this.callbacks,
				imax = cbs.length,
				i = -1;
			
			if (imax === 0){
				return;
			}
			
			while(++i < imax) {
				var x = cbs[i];
				if (x == null || x.state > this.state) {
					continue;
				}
	
				cbs.splice(i, 1);
				imax--;
				i--;
				x.callback(this);
	
				if (this.state < currentState) {
					break;
				}
			}
		},
	
		/** assets loaded and DomContentLoaded */
	
		ready: function(callback) {
			var that = this;
			return this.on(4, function() {
				Events.ready(function(){
					that.resolve(callback);
				});
			}, this);
		},
	
		/** assets loaded */
		done: function(callback) {
			var that = this;
			return this.on(4, function(){
				that.resolve(callback);
			}, this);
		},
		resolve: function(callback) {
			var includes = this.includes,
				length = includes == null
					? 0
					: includes.length
					;
	
			if (length > 0 && this.response == null){
				this.response = {};
	
				var resource,
					route;
	
				for(var i = 0, x; i < length; i++){
					x = includes[i];
					resource = x.resource;
					route = x.route;
	
					if (typeof resource.exports === 'undefined')
						continue;
	
					var type = resource.type;
					switch (type) {
					case 'js':
					case 'load':
					case 'ajax':
					case 'mask':
						var alias = route.alias || Routes.parseAlias(route),
							obj = type === 'js'
								? (this.response)
								: (this.response[type] || (this.response[type] = {}))
								;
	
						if (alias != null) {
							var exp = resource.exports;
							if (cfg.es6Exports && (exp != null && typeof exp === 'object')) {
								exp = exp.default || exp;
							}						
							obj[ alias ] = exp;
							break;
						}
						console.warn('<includejs> Alias is undefined', resource);
						break;
					}
				}
			}
	
			var response = this.response || emptyResponse;
			var that = this;
			if (this._use == null && this._usage != null){
				this._use = tree_resolveUsage(this, this._usage, function(){
					that.state = 4;
					that.resolve(callback);
					that.readystatechanged(4);
				});
				if (this.state < 4)
					return;
			}
			if (this._use) {
				callback.apply(null, [response].concat(this._use));
				return;
			}
	
			var before = null;
			if (this.type === 'js') {
				before = global.include
				global.include = this;
			}
			callback(response);
			if (before != null && global.include === this) {
				global.include = before;	
			}
		}
	};
	
	// end:source ../src/4.IncludeDeferred.js
	// source ../src/5.Include.js
	var Include,
		IncludeLib = {
			loadBags: [
				document
			]
		};
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
			isRoot: false,
	
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
	
						var id = info.url,
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
							var query = '[data-bundler-path="/' + url + '"]';
							var bags = IncludeLib.loadBags,
								j = bags.length, 
								el = null;
							while( --j > -1 && el == null){
								if (bags[j] == null) continue;
								el = bags[j].querySelector(query);
							}
							if (el == null) {
								console.error('"%s" Data was not embedded into html', id);
								break;
							}
							resource.exports = el.innerHTML;
							if (CustomLoader.exists(resource)){
	
								resource.state = 3;
								CustomLoader.load(resource, CustomLoader_onComplete);
							}
							break;
						}
	
						Bin.add(key, id, resource);
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
					resource.isRoot = true;
					resource.state = 4;
					return resource;
				}
				resource = new Resource('js');
				resource.state = 4;
				resource.url = path_resolveUrl(url, parent);
				resource.location = path_getDir(resource.url);
				resource.parent = parent;
				resource.isRoot = true;
				return resource;
			},
	
			getResource: function(url, type){
				if (this.base && url[0] === '/')
					url = this.base + url.substring(1);
	
				return incl_getResource(url, type)
			},
			getResourceById: function(url, type){
				var _res = Bin.get(type, url);
				if (_res != null)
					return _res;
	
				if (this.base && url[0] === '/') {
					_res = Bin.get(type, path_combine(this.base, url));
					if (_res != null)
						return _res;
				}
				if (this.base && this.location) {
					_res = Bin.get(type, path_combine(this.base, this.location, url));
					if (_res != null)
						return _res;
				}
				if (this.location) {
					_res = Bin.get(path_combine(this.location, url));
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
					if (key === 'all' || (type != null && type !== key))
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
				return Bin.get(type, id);
			}
	
			for (var key in bin) {
				if (bin[key].hasOwnProperty(id)) {
					return Bin.get(key, id);
				}
			}
			return null;
		}
	
	
		function embedPlugin(source) {
			eval(source);
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
	
	// end:source ../src/5.Include.js
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
		// source loader/load.js
		var LoadBundleParser = {
			process: function(source, res){
				var div = document.createElement('div');
				div.innerHTML = source;
				IncludeLib.loadBags.push(div);
				return null;
			}
		};
		
		
		// end:source loader/load.js
	
		cfg.loader = {
			json : JSONParser,
			load: LoadBundleParser
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
	
			return (cfg.loader[extension] = new Resource(
				'js',
				Routes.resolve(namespace, path),
				namespace,
				null,
				null,
				null,
				1
			));
		}
	
		function loader_completeDelegate(callback, resource) {
			return function(response){
				callback(resource, response);
			};
		}
	
		function loader_process(source, resource, loader, callback) {
			if (loader.process == null) {
				callback(resource, source);
				return;
			}
	
			var delegate = loader_completeDelegate(callback, resource),
				syncResponse = loader.process(source, resource, delegate);
	
			// match also null
			if (typeof syncResponse !== 'undefined') {
				callback(resource, syncResponse);
			}
		}
	
		function tryLoad(resource, loader, callback) {
			if (typeof resource.exports === 'string') {
				loader_process(resource.exports, resource, loader, callback);
				return;
			}
	
			function onLoad(resource, response){
				loader_process(response, resource, loader, callback);
			}
	
			if (loader.load)
				return loader.load(resource, onLoad);
	
			XHR(resource, onLoad);
		}
	
		return {
			load: function(resource, callback) {
	
				var loader = createLoader(resource.url);
	
				if (loader.process) {
					tryLoad(resource, loader, callback);
					return;
				}
	
				loader.on(4, function() {
					tryLoad(resource, loader.exports, callback);
				}, null, 'push');
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
	var Resource;
	
	(function(Include, Routes, ScriptStack, CustomLoader) {
	
		Resource = function(type, route, namespace, xpath, parent, id, priority) {
			Include.call(this);
	
			var url = route && route.path;
			if (url != null) {
				url = path_normalize(url);
				url = PathResolver.resolveBasic(url, type, parent);
			}
			if (id == null && url) {
				id = url;
			}
			var resource = Bin.get(type, id);
			if (resource) {
				if (resource.state < 4 && type === 'js') {
					ScriptStack.moveToParent(resource, parent);
				}
				return resource;
			}
	
			this.id = id;
			this.url = url;
			this.type = type;
			this.xpath = xpath;
			this.route = route;
			this.parent = parent;
			this.priority = priority;
			this.namespace = namespace;
			this.base = parent && parent.base;
			this.childLoaded = fn_proxy(this.childLoaded, this);
	
			if (url == null) {
				this.state = 3;
				this.location = path_getDir(path_resolveCurrent());
				return this;
			}
	
			this.state = 0;
			this.location = path_getDir(url);
	
			Bin.add(type, id, this);
			if (PathResolver.isNpm(this.url) === false) {
				process(this);
				return this;
			}
	
			var self = this;
			PathResolver.resolveNpm(this.url, this.type, this.parent, function(error, url){
				if (error) {
					self.readystatechanged(4);
					return;
				}
				self.url = url;
				process(self);
			});
			return this;
		};
	
		Resource.prototype = obj_inherit(Resource, Include, {
	
			state: null,
			location: null,
			includes: null,
			response: null,
	
			url: null,
			base: null,
			type: null,
			xpath: null,
			route: null,
			parent: null,
			priority: null,
			namespace: null,
	
			setBase: function(baseUrl){
				this.base = baseUrl;
				return this;
			},
	
			childLoaded: function(child) {
				var resource = this,
					includes = resource.includes;
				if (includes && includes.length) {
					if (resource.state < 3) {
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
	
				this.state = this.state >= 3
					? 3
					: 2;
				this.response = null;
	
				if (this.includes == null)
					this.includes = [];
	
	
				resource = new Resource(type, route, namespace, xpath, this, id);
	
				this.includes.push({
					resource: resource,
					route: route
				});
	
				return resource;
			},
			include: function(type, pckg) {
				var that = this,
					children = [],
					child;
				Routes.each(type, pckg, function(namespace, route, xpath) {
					if (that.route != null && that.route.path === route.path) {
						// loading itself
						return;
					}
					child = that.create(type, route, namespace, xpath);
					children.push(child);
				});
	
				var i = -1,
					imax = children.length;
				while ( ++i < imax ){
					children[i].on(4, this.childLoaded);
				}
	
				return this;
			},
			require: function(arr) {
				if (this.exports == null) {
					this.exports = {};
				}
				this.includes = [];
	
				var pckg = res_groupByType(arr);
				for(var key in pckg) {
					this.include(key, pckg[key]);
				}
				return this;
			},
	
			pause: function(){
				this.state = 2.5;
	
				var that = this;
				return function(exports){
	
					if (arguments.length === 1)
						that.exports = exports;
	
					that.readystatechanged(3);
				};
			},
	
			getNestedOfType: function(type){
				return resource_getChildren(this.includes, type);
			}
		});
	
		// private
	
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
					case 'mask':
						XHR(resource, onXHRCompleted);
						break;
					case 'css':
						resource.state = 4;
	
						var tag = document.createElement('link');
						tag.href = url;
						tag.rel = "stylesheet";
						tag.type = "text/css";
						document.body.appendChild(tag);
						break;
				}
			} else {
	
				if ('js' === type || 'embed' === type) {
					ScriptStack.add(resource, resource.parent);
				}
	
				CustomLoader.load(resource, onXHRCompleted);
			}
	
			return resource;
		}
	
		function onXHRCompleted(resource, response) {
			if (!response) {
				console.warn('Resource can`t be loaded', resource.url);
				//- resource.readystatechanged(4);
				//- return;
			}
	
			switch (resource.type) {
				case 'js':
				case 'embed':
					resource.source = response;
					resource.state = 2;
					ScriptStack.touch();
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
				case 'mask':
					if (response) {
						var mask = global.mask;
						if (mask == null) {
							mask = global.require('mask');
						}
						mask
							.Module
							.registerModule(response, { path: resource.url })
							.done(function(module){
								resource.exports = module.exports;
								resource.readystatechanged(4);
							})
							.fail(function(error){
								console.error(error);
								resource.readystatechanged(4);
							});
						return;
					}
					break;
			}
	
			resource.readystatechanged(4);
		}
	
		function resource_getChildren(includes, type, out) {
			if (includes == null)
				return null;
	
			if (out == null)
				out = [];
	
			var imax = includes.length,
				i = -1,
				x;
			while ( ++i < imax ){
				x = includes[i].resource;
	
				if (type === x.type)
					out.push(x);
	
				if (x.includes != null)
					resource_getChildren(x.includes, type, out);
			}
			return out;
		}
	
	}(Include, Routes, ScriptStack, CustomLoader));
	// end:source ../src/9.Resource.js

	// source ../src/modules/exports.js
	var __nativeRequire,
		__includeRequire;
	
	if (global.require) {
		var name = global.require.name;
		if (name !== 'amd' && name !== 'commonjs') {
			__nativeRequire = global.require;
		}
	}
	
	// source ./common.js
	var CommonJS;
	(function(){
		CommonJS = {
			exports: null,
			require: function commonjs(path){
				if (path.charCodeAt(0) !== 46 && __nativeRequire != null) {
					// .
					return __nativeRequire(path);
				}
	
				var currentSync = cfg.sync;
				var currentEval = cfg.eval;
				var currentInclude = include;
				var exports = null;
	
				cfg.sync = true;
				cfg.eval = true;
				include.js(path + '::Module').done(function(resp) {
					exports = resp.Module;
				});
				include = currentInclude;
				cfg.sync = currentSync;
				cfg.eval = currentEval;
				return exports;
			},
			enable: function () {
				if (typeof __nativeRequire === 'function') {
					return;
				}
	
				enableExports();
				enableRequire();
			}
		};
	
	
		function enableRequire(){
			global.require = CommonJS.require
		}
	
		function enableExports() {
			if (typeof module !== 'undefined') {
				return;
			}
			if (typeof Object.defineProperty === 'undefined'){
				console.warn('Browser do not support Object.defineProperty');
				return;
			}
			Object.defineProperty(global, 'module', {
				get: function() {
					return global.include;
				},
				configurable: true
			});
	
			Object.defineProperty(global, 'exports', {
				get: function() {
					var current = global.include;
					return (current.exports || (current.exports = {}));
				},
				set: function(exports) {
					global.include.exports = exports;
				},
				configurable: true
			});
		}
	
	}());
	// end:source ./common.js
	// source ./amd.js
	var Amd;
	(function(){
	
		Amd = {
			enable: function () {
				enable();
			}
		};
	
		var enable;
		(function () {
			enable = function(){
				var define = global.define = function(a, b, c){
					var i = arguments.length, args = new Array(i);
					while (--i > -1) args[i] = arguments[i];
	
					var fn = getFn(patterns, args);
					var module = global.include;
					fn(module, a, b, c);
				};
				__includeRequire = global.require = function amd(){
					if (isNode && __nativeRequire && arguments.length === 1) {
						return __nativeRequire.apply(null, arguments);
					}
					return define.apply(null, arguments);
				};
				if (typeof require !== 'undefined') {
					require = __includeRequire;
				}
			};
			var patterns = [
				[ [isExports], function(module, exports){
					define(module, null, null, exports);
				} ],
				[ [isString, isExports], function(module, name, exports){
					define(module, name, null, exports);
				} ],
				[ [isString, isArray, isExports], function(module, name, dependencies, exports){
					define(module, name, dependencies, exports);
				} ],
				[ [isArray, isExports], function(module, dependencies, exports){
					define(module, null, dependencies, exports);
				} ]
			];
			function getFn(patterns, args) {
				var i = -1, imax = patterns.length;
				outer: while (++i < imax) {
					var pattern = patterns[i][0];
					if (pattern.length !== args.length) {
						continue;
					}
					var j = -1, jmax = pattern.length;
					while (++j < jmax) {
						var matcher = pattern[j];
						if (matcher(args[j]) === false) {
							continue outer;
						}
					}
					return patterns[i][1];
				}
				console.warn('Define function arguments are invalid', args);
				return emptyFn;
			}
			function emptyFn() {
	
			}
			function define(module, name, dependencies, exports) {
				if (name != null) {
					bin.js[name] = module;
				}
				if (dependencies == null) {
					module.exports = getExports(exports) || module.exports;
					return;
				}
				var deps = getDepsInfo(dependencies, module);
				var arr = deps.array;
				var linked = deps.linked;
				if (linked.length === 0) {
					module.exports = getExports(exports, arr) || module.exports;
					return;
				}
				module.require(deps.linked).done(function(resp){
					readResp(arr, resp);
					module.exports = getExports(exports, arr) || module.exports;
				});
			}
			function getExports(mix, args) {
				if (typeof mix === 'function') {
					return mix.apply(null, args || []);
				}
				return mix;
			}
			function getDepsInfo(deps, module) {
				var array = new Array(deps.length),
					linked = [],
					imax = deps.length,
					i = -1;
				while (++i < imax) {
					var fn = StaticResolvers[deps[i]];
					if (fn == null) {
						linked.push(deps[i] + '::' + i);
						continue;
					}
					array[i] = fn(module);
				}
				return { array: array, linked: linked };
			}
			var StaticResolvers = {
				'module': function(module) { return module },
				'exports': function(module) { return module.exports = {} },
				'require': function(module) { return CommonJS.require }
			};
			function isString(x) {
				return typeof x === 'string';
			}
			function isExports(x) {
				return true;
			}
			function isArray(x) {
				return x instanceof Array;
			}
		}());
	
		function enableExports() {
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
	
		function readResp(arr, resp) {
			var digit = /^\d+$/;
			for(var key in resp) {
				var val = resp[key];
				if (val == null) {
					continue;
				}
				if (key === 'load' || key === 'ajax') {
					readResp(arr, val);
					continue;
				}
				arr[+key] = val;
			}
		}
	
	}());
	// end:source ./amd.js
	
	// end:source ../src/modules/exports.js
	// source ../src/PathResolver.js
	var PathResolver;
	(function(){
		PathResolver = {
			configMap: function(map){
				for(var key in map) {
					_map[key] = map;
				}
			},
			configExt: function(config){
				var def = config.def,
					types = config.types;
				for (var key in def) {
					_ext[key] = def[key];
				}
				for(var key in types) {
					_extTypes[key] = types[key];
				}
			},
			resolveBasic: function(path_, type, parent) {
				if (type === 'js' && isNodeModuleResolution(path_)) {
					return path_;
				}
				var path = path_resolveUrl(map(path_), parent);
				return ensureExtension(path, type);
			},
			isNpm: isNodeModuleResolution,
			getType: getTypeForPath,
			resolveNpm: function(path_, type, parent, cb){
				var path = map(path_);
				if (path.indexOf('.') > -1) {
					cb(null, path);
					return;
				}
				if (type === 'js') {
					if (isNodeModuleResolution(path)) {
						var parentsPath = parent && parent.location || path_resolveCurrent();
						nodeModuleResolve(parentsPath, path, cb);
						return;
					}
				}
				if (hasExt(path) === false) {
					path += '.' + _ext[type];
				}
				cb(null, path);
			}
		};
		var _map = {};
		var _ext = {
			'js': 'js',
			'css': 'css',
			'mask': 'mask'
		};
		var _extTypes = {
			'js': 'js',
			'es6': 'js',
			'ts': 'js',
			'css': 'css',
			'less': 'css',
			'scss': 'css',
			'mask': 'mask',
			'json': 'load',
			'yml': 'load'
		};
		function map(path) {
			return _map[path] || path;
		}
		function hasExt(path) {
			return /\.[\w]{1,8}($|\?)/.test(path);
		}
		function isNodeModuleResolution(path){
			return /^([\w\-]+)(\/[\w\-_]+)*$/.test(path);
		}
		function nodeModuleResolve(current_, path, cb){
			var name = /^([\w\-]+)/.exec(path)[0];
			var resource = path.substring(name.length + 1);
			if (resource && hasExt(resource) === false) {
				resource += '.' + _ext.js;
			}
			var current = current_.replace(/[^\/]+\.[\w]{1,8}$/, '');
			function check(){
				var nodeModules = current + '/node_modules/' + name + '/';
				var pckg = nodeModules + 'package.json';
				XHR_LOAD(pckg, function(error, text){
					var json;
					if (text) {
						try { json = JSON.parse(text); }
						catch (error) {}
					}
					if (error != null || json == null) {
						var next = current.replace(/[^\/]+$/, '');
						if (next === current) {
							cb('Not found');
							return;
						}
						check();
						return;
					}
					if (resource) {
						cb(null, nodeModules + resource);
						return;
					}
					if (json.main) {
						cb(null, path_combine(nodeModules, json.main));
						return;
					}
	
					cb(null, nodeModules + 'index.' + _ext.js);
				});
			}
			check();
		}
		function ensureExtension(path, type) {
			if (hasExt(path)) {
				return path;
			}
			var ext = _ext[type];
			if (ext == null) {
				console.warn('Extension is not defined for ' + type);
				return path;
			}
			var i = path.indexOf('?');
			if (i === -1) return path + '.' + ext;
	
			return path.substring(0, i) + '.' + ext + path.substring(i);
		}
		function getTypeForPath(path){
			var match = /\.([\w]{1,8})($|\?)/.exec(path);
			if (match === null) {
				return _ext.js;
			}
			var ext = match[1];
			var type = _extTypes[ext];
			if (type == null) {
				throw Error('Unknown type for extension: ' + ext);
			}
			return type;
		}
	
	}());
	// end:source ../src/PathResolver.js

	// source ../src/10.export.js
	IncludeLib.Routes = RoutesLib;
	IncludeLib.Resource = Resource;
	IncludeLib.ScriptStack = ScriptStack;
	IncludeLib.PathResolver = PathResolver;
	IncludeLib.Config = Config;
	IncludeLib.registerLoader = CustomLoader.register;
	
	exports.include = new Include();
	exports.includeLib = IncludeLib;
	
	// end:source ../src/10.export.js

	// source ../src/node/node.js
	(function(){
	
		cfg.server = true;
	
		// source utils/file.js
		var fs_exists,
			file_read,
		    file_watch;
		
		(function(){
		    var _fs = require('fs'),
				_watchers = {};
		
		    file_read = function(url, callback){
				if (cfg.sync) {
					try {
						var content = _fs.readFileSync(url, 'utf8');
		
						callback(null, content);
					} catch(error) {
						console.error('File Read - ', error);
					}
		
					return;
				}
				_fs.readFile(url, 'utf8', callback);
		    };
		
		    file_watch =  function(path, callback){
		        _unbind(path);
		        _watchers[path] = _fs.watch(path, callback);
		    };
		
			fs_exists = function(path){
				return _fs.existsSync(path);
			};
		
		    function _unbind(path) {
		        if (_watchers[path] == null)
		            return;
		
		        _watchers[path].close();
		        _watchers[path] = null;
		    }
		
		}());
		
		// end:source utils/file.js
		// source utils/bin.js
		var bin_removeDelegate,
		    bin_remove,
		    bin_tryReload
		    ;
		
		(function(){
		        
		    bin_removeDelegate = function(url) {
		        // use timeout as sys-file-change event is called twice
		        var timeout;
		        return function() {
		            if (timeout)
		                clearTimeout(timeout);
		    
		            timeout = setTimeout(function() {
		                
		                var triggerFn;
		                if (typeof cfg.autoreload === 'object') {
		                    triggerFn = function(state){
		                        state !== false && cfg.autoreload.fileChanged(url, 'include');
		                    };
		                }
		                
		                bin_tryReload(url, triggerFn);
		                
		            }, 150);
		        };
		    };
		    
		    bin_remove = function(path) {
		        if (path == null)
		            return;
		    
		        var type,
		            id,
		            index,
		            res,
		            parents = []
		            ;
		    
		        for (type in bin) {
		    
		            for (id in bin[type]) {
		                res = bin[type][id];
		    
		                index = id.indexOf(path);
		                if (index !== -1 && index === id.length - path.length) {
		    
		                    bin_clearCache(type, id);
		                    
		                    var arr = res.parent && res.parent.url
		                        ? bin_remove(res.parent.url)
		                        : [ res ]
		                        ;
		                    parents
		                        .push
		                        .apply(parents, arr);
		                }
		            }
		    
		        }
		        
		        if (parents.length === 0) {
		            console.warn('<include:res:remove> Resource is not in cache', path);
		        }
		            
		        return parents;
		    };
		    
		    bin_tryReload = function(path, callback) {
		        var parents = bin_remove(path).filter(function(x){ return x != null; });
		        if (parents.length === 0) {
		            callback && callback(false);
		            return;
		        }
		        
		        var count = parents.length,
		            imax = count,
		            i = -1;
		        
		        while (++i < imax) {
		            bin_load(parents[i])
		                .done(function(){
		                    
		                    if (--count === 0 && callback) 
		                        callback();
		                });
		        }
		    }
		
		    // PRIVATE
		    
		    function bin_load(resource) {
		        if (resource == null)
		            return;
		    
		        resource.content = null;
		        resource.exports = null;
		    
		        var parent = resource.parent;
		        return parent
		            .create(
		                resource.type,
		                resource.route,
		                resource.namespace,
		                resource.xpath
		            )
		            .on(4, parent.childLoaded);
		    
		    }
		    
		    function bin_clearCache(type, id){
		        var resource = bin[type][id],
		            children = resource.includes
		            ;
		        delete bin[type][id];
		        
		        if (children == null) 
		            return;
		        
		        children.forEach(function(child){
		            var resource = child.resource,
		                type = resource.type,
		                id = resource.url
		                ;
		                
		            if (id[0] !== '/') 
		                id = '/' + id;
		                
		            delete bin[type][id];
		        });
		    }
		    
		}());
		
		// end:source utils/bin.js
	
	
	    // source xhr.js
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
	                    console.error('[IncludeJS] File error', err.code, err.path);
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
	    // end:source xhr.js
	
		// source export-resource.js
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
		                    next.paths.push(atmaPath);
		
		                if (npmPath)
		                    next.paths.push(npmPath);
		
		
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
		// end:source export-resource.js
		// source export-include.js
		obj_inherit(Include, {
		    
		    isBrowser: false,
		    isNode: true,
		    
		    
		    bin_tryReload: bin_tryReload,
		    bin_remove: bin_remove
		});
		// end:source export-include.js
	}());
	// end:source ../src/node/node.js

	// source ../src/eval-node.js
	var vm = require('vm');
	var Module = (global.module || module).constructor;
	
	function __eval (source, include, isGlobalCntx) {
	    module.exports = {};
	
	    global.include = include;
	    global.require = require;
	    global.exports = module.exports;
	    global.__filename = path_getFile(include.url);
	    global.__dirname = path_getDir(global.__filename);
	    global.module = module;
	
	    if (isGlobalCntx !== true) {
	        source = '(function(){ ' + source + '\n}())';
	    }
	
	    try {
	        if (!isGlobalCntx) {
	            var filename = global.__filename
	            module = new Module(filename, module);
	            module.paths = Module._nodeModulePaths(path_getDir(filename));
	            module.filename = filename;
	            module._compile(source, filename);
	            module.loaded = true;
	        }
	
	        else {
	            vm.runInThisContext(source, global.__filename);
	        }
	
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
	
	// end:source ../src/eval-node.js
}));
