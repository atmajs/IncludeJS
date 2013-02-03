
var __eval = function(source, include) {
	"use strict";
	
	var iparams = include && include.route.params;
	
	try {
		return eval(source);
	} catch (error) {
		error.url = include && include.url;
		//Helper.reportError(error);
		console.error(error);
	}
	
};

;(function(global, document) {

	"use strict";
	
	


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
	cfg = {
		eval: document == null
	},	
	handler = {},
	hasOwnProp = {}.hasOwnProperty,
	//-currentParent = null,
	XMLHttpRequest = global.XMLHttpRequest;
	
var Helper = { /** TODO: improve url handling*/
	uri: {
		getDir: function(url) {
			var index = url.lastIndexOf('/');
			return index == -1 ? '' : url.substring(index + 1, -index);
		},
		/** @obsolete */
		resolveCurrent: function() {
			var scripts = document.getElementsByTagName('script');
			return scripts[scripts.length - 1].getAttribute('src');
		},
		resolveUrl: function(url, parent) {
			if (cfg.path && url[0] == '/') {
				url = cfg.path + url.substring(1);
			}

			switch (url.substring(0, 5)) {
				case 'file:':
				case 'http:':
					return url;
			}

			if (url.substring(0,2) === './'){
				url = url.substring(2);
			}


			if (url[0] === '/') {
				if (isWeb === false || cfg.lockedToFolder === true) {
					url = url.substring(1);
				}
			}else if (parent != null && parent.location != null) {
				url = parent.location + url;
			}


			while(url.indexOf('../') > -1){
				url = url.replace(/[^\/]+\/\.\.\//,'');
			}

			return url;
		}
	},
	extend: function(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];
			if (typeof source === 'function') {
				source = source.prototype;
			}
			for (var key in source) {
				target[key] = source[key];
			}
		}
		return target;
	},
	invokeEach: function(arr, args) {
		if (arr == null) {
			return;
		}
		if (arr instanceof Array) {
			for (var i = 0, x, length = arr.length; i < length; i++) {
				x = arr[i];
				if (typeof x === 'function') {
					(args != null ? x.apply(this, args) : x());
				}
			}
		}
	},
	doNothing: function(fn) {
		typeof fn == 'function' && fn();
	},
	reportError: function(e) {
		console.error('IncludeJS Error:', e, e.message, e.url);
		typeof handler.onerror == 'function' && handler.onerror(e);
	},
	ensureArray: function(obj, xpath) {
		if (!xpath) {
			return obj;
		}
		var arr = xpath.split('.');
		while (arr.length - 1) {
			var key = arr.shift();
			obj = obj[key] || (obj[key] = {});
		}
		return (obj[arr.shift()] = []);
	}
},

	XHR = function(resource, callback) {
		var xhr = new XMLHttpRequest(),
			s = Date.now();
		xhr.onreadystatechange = function() {
			xhr.readyState == 4 && callback && callback(resource, xhr.responseText);
		};

		xhr.open('GET', typeof resource === 'object' ? resource.url : resource, true);
		xhr.send();
	};

var RoutesLib = function() {

	var routes = {},
		regexpAlias = /([^\\\/]+)\.\w+$/;

	return {
		/**
		 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
		 */
		register: function(namespace, route) {

			routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);

		},

		/**
		 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
		 */
		resolve: function(namespace, template) {
			var questionMark = template.indexOf('?'),
				aliasIndex = template.indexOf('::'),
				alias, path, params, route, i, x, length;
				
			
			if (~aliasIndex){
				alias = template.substring(aliasIndex + 2);
				template = template.substring(0, aliasIndex);
			}
			
			if (~questionMark) {
				var arr = template.substring(questionMark + 1).split('&');

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
					
					if (i == route.length - 2){
						for(index++;index < template.length; index++){
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

			if (type == 'lazy' && xpath == null) {
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
var Events = (function(document) {
	if (document == null) {
		return {
			ready: Helper.doNothing,
			load: Helper.doNothing
		};
	}
	var readycollection = [],
		loadcollection = null,
		timer = Date.now();

	document.onreadystatechange = function() {
		if (/complete|interactive/g.test(document.readyState) === false) {
			return;
		}
		if (timer) {
			console.log('DOMContentLoader', document.readyState, Date.now() - timer, 'ms');
		}
		Events.ready = Helper.doNothing;

		Helper.invokeEach(readycollection);
		readycollection = null;
		

		if (document.readyState == 'complete') {
			Events.load = Helper.doNothing;
			Helper.invokeEach(loadcollection);
			loadcollection = null;
		}
	};

	return {
		ready: function(callback) {
			readycollection.unshift(callback);
		},
		load: function(callback) {
			(loadcollection || (loadcollection = [])).unshift(callback);
		}
	};
})(document);

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

	on: function(state, callback) {
		state <= this.state ? callback(this) : this.callbacks[this.state < 3 ? 'unshift':'push']({
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
					if (includes[i].resource.state != 4) {
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
		return this.on(4, function() {
			Events.ready(this.resolve.bind(this, callback));
		}.bind(this));
	},
	/** assest loaded and window is loaded */
	loaded: function(callback) {
		return this.on(4, function() {
			Events.load(callback);
		});
	},
	/** assets loaded */
	done: function(callback) {
		return this.on(4, this.resolve.bind(this, callback));
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
						obj = type == 'js' ? this.response : (this.response[type] || (this.response[type] = {}));

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

var Include = (function() {

	function embedPlugin(source) {
		eval(source);
	}

	function enableModules() {
		Object.defineProperty(global, 'module', {
			get: function() {
				return global.include;
			}
		});

		Object.defineProperty(global, 'exports', {
			get: function() {
				var current = global.include;
				return (current.exports || (current.export = {}));
			},
			set: function(exports) {
				global.include.exports = exports;
			}
		});
	}

	var Include = function() {};
	Include.prototype = {
		setCurrent: function(data) {

			var resource = new Resource('js', {
				path: data.id
			}, data.namespace, null, null, data.id);

			if (resource.state != 4) {
				console.error("Current Resource should be loaded");
			}

			/**@TODO - probably state shoulb be changed to 2 at this place */
			resource.state = 3;
			global.include = resource;

		},
		incl: function(type, pckg) {

			if (this instanceof Resource) {
				return this.include(type, pckg);
			}
			var r = new Resource();

			r.type = 'js';

			return r.include(type, pckg);
		},
		js: function(pckg) {
			return this.incl('js', pckg);
		},
		css: function(pckg) {
			return this.incl('css', pckg);
		},
		load: function(pckg) {
			return this.incl('load', pckg);
		},
		ajax: function(pckg) {
			return this.incl('ajax', pckg);
		},
		embed: function(pckg) {
			return this.incl('embed', pckg);
		},
		lazy: function(pckg) {
			return this.incl('lazy', pckg);
		},

		cfg: function(arg) {
			switch (typeof arg) {
			case 'object':
				for (var key in arg) {
					cfg[key] = arg[key];

					if (key == 'modules' && arg[key] === true) {
						enableModules();
					}
				}
				break;
			case 'string':
				if (arguments.length == 1) {
					return cfg[arg];
				}
				if (arguments.length == 2) {
					cfg[arg] = arguments[1];
				}
				break;
			case 'undefined':
				return cfg;
			}
			return this;
		},
		routes: function(arg) {
			if (arg == null) {
				return Routes.getRoutes();
			}
			for (var key in arg) {
				Routes.register(key, arg[key]);
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
						if (url[0] == '/') {
							url = url.substring(1);
						}
						resource.location = Helper.uri.getDir(url);
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
					}(bin[key] || (bin[key] = {}))[id] = resource;
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
			var id = (url[0] == '/' ? '' : '/') + url;

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

					if (j == length - 1 && callback) {
						callback();
						callback = null;
					}
				};
			Routes.each('', pckg, function(namespace, route) {
				urls.push(route.path[0] == '/' ? route.path.substring(1) : route.path);
			});

			length = urls.length;

			for (; i < length; i++) {
				XHR(urls[i], onload);
			}
			return this;
		}
	};

	return Include;
}());

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
					(this.readyState == 'complete' || this.readyState == 'loaded') && callback();
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


				if (e && e.type == 'error') {
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

				if (i == length) {
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
				if (x == resource) {
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
		/** Move resource in stack close to parent */
		moveToParent: function(resource, parent) {
			var i, length, x, tasks = 2;

			for (i = 0, x, length = stack.length; i < length && tasks; i++) {
				x = stack[i];

				if (x === resource) {
					stack.splice(i, 1);
					length--;
					i--;
					tasks--;
				}

				if (x === parent) {
					stack.splice(i, 0, resource);
					length++;
					i++;
					tasks--;
				}
			}

			if (parent == null) {
				stack.unshift(resource);
			}

		}
	};
})();
var CustomLoader = (function() {

	var _loaders = {};


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

	return {
		load: function(resource, callback) {

			var loader = createLoader(resource.url);
			loader.done(function() {
				XHR(resource, function(resource, response) {
					callback(resource, loader.exports.process(response, resource));
				});
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
var Resource = (function(Include, IncludeDeferred, Routes, ScriptStack, CustomLoader) {

	function process(resource, loader) {
		var type = resource.type,
			parent = resource.parent,
			url = resource.url;

		if (CustomLoader.exists(resource) === false) {
			switch (type) {
			case 'js':
			case 'embed':
				ScriptStack.load(resource, parent, type == 'embed');
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
			ScriptStack.load(resource, resource.parent, resource.type == 'embed');
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

	function childLoaded(resource, child) {
		var includes = resource.includes;
		if (includes && includes.length) {
			if (resource.state < 3 /* && resource.url != null */ ) {
				// resource still loading/include is in process, but one of sub resources are already done
				return;
			}
			for (var i = 0; i < includes.length; i++) {
				if (includes[i].resource.state != 4) {
					return;
				}
			}
		}
		resource.readystatechanged(4);
	}

	var Resource = function(type, route, namespace, xpath, parent, id) {
		Include.call(this);
		IncludeDeferred.call(this);

		var url = route && route.path;

		if (url != null) {
			this.url = url = Helper.uri.resolveUrl(url, parent);
		}

		this.route = route;
		this.namespace = namespace;
		this.type = type;
		this.xpath = xpath;

		this.parent = parent;

		if (id == null && url) {
			id = (url[0] == '/' ? '' : '/') + url;
		}


		var resource = bin[type] && bin[type][id];
		if (resource) {

			if (resource.state < 4 && type == 'js') {
				ScriptStack.moveToParent(resource, parent);
			}

			return resource;
		}

		if (url == null) {
			this.state = 3;
			return this;
		}


		this.location = Helper.uri.getDir(url);



		(bin[type] || (bin[type] = {}))[id] = this;

		if (cfg.version){
			this.url += (!~this.url.indexOf('?') ? '?' : '&' ) + 'v=' + cfg.version;
		}

		return process(this);

	};

	Resource.prototype = Helper.extend({}, IncludeDeferred, Include, {
		include: function(type, pckg) {
			this.state = this.state >= 3 ? 3 : 2;

			if (this.includes == null) {
				this.includes = [];
			}
			if (this.childLoaded == null){
				this.childLoaded = childLoaded.bind(this, this);
			}

			this.response = null;

			var _childLoaded = childLoaded.bind(this);

			Routes.each(type, pckg, function(namespace, route, xpath) {

				var resource = new Resource(type, route, namespace, xpath, this);

				this.includes.push({
					resource: resource,
					route: route
				});
				resource.on(4, this.childLoaded);
			}.bind(this));

			return this;
		}
	});

	return Resource;

}(Include, IncludeDeferred, Routes, ScriptStack, CustomLoader));


global.include = new Include();

global.includeLib = {
	Helper: Helper,
	Routes: RoutesLib,
	Resource: Resource,
	ScriptStack: ScriptStack,
	registerLoader: CustomLoader.register
};
(function(){

	var fs = require('fs'),
		vm = require('vm');

	 	
	XMLHttpRequest = function(){};
	XMLHttpRequest.prototype = {
		open: function(method, url){
			this.url = url;
		},
		send: function(){
			
			if (this.url.indexOf('file:///') > -1){
				this.url = this.url.replace('file:///','');
			}
			
			var that = this;
			fs.readFile(this.url, 'utf-8', function(err, data){
				if (err) {
					console.error('>>', err.code, err.path);
					data = '';		
				}

				that.readyState = 4;
				that.responseText = data;
				that.onreadystatechange();			
			});
		}
	};

	__eval = function(source, include){	

		global.include = include;
		global.require = require;
	    global.exports = module.exports;
	    global.__filename = getFile(include.url);
	    global.__dirname = getDir(global.__filename);
	    global.module = module;

		vm.runInThisContext(source, include.url);
		
	};


	function getFile(url){
		return url.replace('file:///', '');
	}
	function getDir(url){
		return url.substring(0, url.lastIndexOf('/'));
	}

}());

})(typeof window === 'undefined' ? global : window, typeof document == 'undefined' ? null : document);