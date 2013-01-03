(function(global) {

	var helper = {
		each: function(arr, fn) {
			if (arr instanceof Array) {
				for (var i = 0; i < arr.length; i++) {
					fn(arr[i]);
				}
				return;
			}
			fn(arr);
		},
		extendProto: function(proto, x) {
			var prototype;
			if (x == null) {
				return;
			}
			switch (typeof x) {
			case 'function':
				prototype = x.prototype;
				break;
			case 'object':
				prototype = x;
				break;
			default:
				return;
			}
			for (var key in prototype) {
				proto[key] = prototype[key];
			}
		},

		extendClass: function(_class, _base, _extends, original) {
			
			if (typeof original !== 'object') {
				return;
			}

			this.extendPrototype = original['__proto__'] == null ? this.protoLess : this.proto;
			this.extendPrototype(_class, _base, _extends, original);
		},
		proto: function(_class, _base, _extends, original) {
			var prototype = original,
				proto = original;
			
			prototype.constructor = _class.prototype.constructor;
			
			if (_extends != null) {
				proto['__proto__'] = {};
				
				helper.each(_extends, function(x) {					
					helper.extendProto(proto['__proto__'], x);
				});
				proto = proto['__proto__'];
			}
			
			if (_base != null) {
				proto['__proto__'] = _base.prototype;
			}

			_class.prototype = prototype;			
		},
		/** browser that doesnt support __proto__ */
		protoLess: function(_class, _base, _extends, original) {

			if (_base != null) {
				var proto = {},
					tmp = function(){};
					
				tmp.prototype = _base.prototype;
				
				_class.prototype = new tmp();				
				_class.prototype.constructor = _class;
			}
			
			helper.extendProto(_class.prototype, original);
			
			
			if (_extends != null) {				
				helper.each(_extends, function(x){
					var a = {};
					helper.extendProto(a, x);
					delete a.constructor;
					for(var key in a){
						_class.prototype[key] = a[key];
					}
				});				
			}
		}
	};

	global.Class = function(data) {
		var _base = data.Base,
			_extends = data.Extends,
			_static = data.Static,
			_construct = data.Construct,
			_class = null,
			key;
			
		if (_base != null) {
			delete data.Base;
		}
		if (_extends != null) {
			delete data.Extends;
		}
		if (_static != null) {
			delete data.Static;
		}
		if (_construct != null) {
			delete data.Construct;
		}
		
		
		if (_base == null && _extends == null) {
			if (_construct == null)   {
				_class = function() {};
			}
			else {
				_class = _construct;
			}
			
			data.constructor = _class.prototype.constructor;
			
			if (_static != null) {
				for (key in _static) {
					_class[key] = _static[key];
				}
			}
	
			_class.prototype = data;
			return _class;

		}
		
		_class = function() {
			
			if (_extends != null){				
				var isarray = _extends instanceof Array,
					length = isarray ? _extends.length : 1,
					x = null;
				for (var i = 0; isarray ? i < length : i < 1; i++) {
					x = isarray ? _extends[i] : _extends;
					if (typeof x === 'function') {
						x.apply(this, arguments);
					}
				}				
			}
			
			if (_base != null) {								
				_base.apply(this, arguments);			
			}
			
			if (_construct != null) {
				var r = _construct.apply(this, arguments);
				if (r != null) {
					return r;
				}
			}
			return this;
		};
		
		if (_static != null)  {
			for (key in _static) {
				_class[key] = _static[key];
			}
		}
		
		
		helper.extendClass(_class, _base, _extends, data);
		
		
		data = null;
		_static = null;
		
		return _class;
	};



}(typeof window === 'undefined' ? global : window));

;
var __eval = function(source, include) {
	"use strict";
	
	var iparams = include.route.params;
	
	try {
		return eval(source);
	} catch (error) {
		error.url = include.url;
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
			var scripts = document.querySelectorAll('script');
			return scripts[scripts.length - 1].getAttribute('src');
		},
		resolveUrl: function(url, parent) {
			if (cfg.path && url[0] == '/') {
				url = cfg.path + url.substring(1);
			}
			if (url[0] == '/') {
				if (isWeb === false || cfg.lockedToFolder === true) {
					return url.substring(1);
				}
				return url;
			}
			switch (url.substring(0, 5)) {
			case 'file:':
			case 'http:':
				return url;
			}

			if (parent != null && parent.location != null) {
				return parent.location + url;
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
	},
	xhr: function(url, callback) {
		var xhr = new XMLHttpRequest(),
			s = Date.now();
		xhr.onreadystatechange = function() {
			xhr.readyState == 4 && callback && callback(url, xhr.responseText);
		};

		xhr.open('GET', url, true);
		xhr.send();
	}
},

	XHR = function(resource, callback) {
		var xhr = new XMLHttpRequest(),
			s = Date.now();
		xhr.onreadystatechange = function() {
			xhr.readyState == 4 && callback && callback(resource, xhr.responseText);
		};

		xhr.open('GET', resource.url, true);
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
		
		parseAlias: function(resource){
			var url = resource.url,
				result = regexpAlias.exec(url);
			
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
var IncludeDeferred = function() {
	this.callbacks = [];
	this.state = 0;
};

IncludeDeferred.prototype = {
	/**	state observer */

	on: function(state, callback) {
		state <= this.state ? callback(this) : this.callbacks.unshift({
			state: state,
			callback: callback
		});
		return this;
	},
	readystatechanged: function(state) {
		var i, x, length;
		
		if (state > this.state){
			this.state = state;
			
			if (this.state === 3){
				var includes = this.includes;
			
				if (includes != null && includes.length) {
					for (i = 0; i < includes.length; i++) {
						if (includes[i].state != 4) {
							return;
						}
					}
				}			
				
				this.state = 4;
			}
			
			//do not set asset resource to global
			if (this.type === 'js' && this.state === 4){
				global.include = this;
			}
			
		}
		
		for (i = 0, length = this.callbacks.length; i < length; i++) {
			x = this.callbacks[i];
			
			if (x.state > this.state || x.callback == null) {
				continue;
			}
			x.callback(this);
			x.callback = null;
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
		callback(this.response);		
	}
};
var Include = function(){};
Include.prototype = {
	setCurrent: function(data) {
		
		var resource = new Resource('js', {
			path: data.id
		}, data.namespace, null, null, data.id);
		
		if (resource.state != 4){
			console.error("Current Resource should be loaded");
		}
		
		resource.state = 2;
		global.include = resource;
		
	},
	incl: function(type, pckg) {

		if (this instanceof Resource) {
			return this.include(type, pckg);
		}
		var r = new Resource();
		
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
			}
			break;
		case 'string':
			if (arguments.length == 1){
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
	routes: function(arg){
		if (arg == null){
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
					var container = document.querySelector('#includejs-' + id.replace(/\W/g,''));
					if (container == null) {
						console.error('"%s" Data was not embedded into html', id);
						return;
					}
					resource.exports = container.innerHTML;						
					break;
				}
				(bin[key] || (bin[key] = {}))[id] = resource;
			}
		}
	},
	/**
	 *	Create new Resource Instance,
	 *	as sometimes it is necessary to call include. on new empty context
	 */
	instance: function(){
		return new Resource();
	}
};
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

			var resource = (currentResource = stack[0]);

			if (resource.state == 1) {
				return;
			}


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

			Helper.xhr(resource.url, function(url, response) {
				if (!response) {
					console.error('Not Loaded:', url);
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

	var _handlers = {};


	var _loaders = {};


	function createLoader(url) {
		var extension = url.substring(url.lastIndexOf('.') + 1);

		if (_loaders.hasOwnProperty(extension)) {
			return _loaders[extension];
		}

		var loaderRoute = cfg.loader[extension],
			path, namespace;

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

			if (resource.state === 0 && type == 'js') {
				ScriptStack.moveToParent(resource, parent);
			}

			// @TODO - [fix] - multiple routes by one resource for multiple parents
			resource.route = route;
			return resource;
		}

		if (url == null) {
			this.state = 3;
			return this;
		}


		this.location = Helper.uri.getDir(url);



		(bin[type] || (bin[type] = {}))[id] = this;

		return process(this);

	};

	Resource.prototype = Helper.extend({}, IncludeDeferred, Include, {
		include: function(type, pckg) {
			//-this.state = 1;
			this.state = this.state >= 3 ? 3 : 1;

			if (this.includes == null) {
				this.includes = [];
			}
			if (this.response == null) {
				this.response = {};
			}


			Routes.each(type, pckg, function(namespace, route, xpath) {
				var resource = new Resource(type, route, namespace, xpath, this);

				this.includes.push(resource);
				resource.on(4, this.childLoaded.bind(this));
			}.bind(this));

			return this;
		},

		childLoaded: function(resource) {


			if (resource && resource.exports) {

				var type = resource.type;
				switch (type) {
				case 'js':
				case 'load':
				case 'ajax':

					var alias = resource.route.alias || Routes.parseAlias(resource),
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

			var includes = this.includes;
			if (includes && includes.length) {
				if (this.state < 3 /* && this.url != null */ ) {
					// resource still loading/include is in process, but one of sub resources are already done 
					return;
				}
				for (var i = 0; i < includes.length; i++) {
					if (includes[i].state != 4) {
						return;
					}
				}
			}

			this.readystatechanged(4);

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

})(typeof window === 'undefined' ? global : window, typeof document == 'undefined' ? null : document);
;include.register({"css":[{"id":"/style/main.css","url":"style/main.css","namespace":""},{"id":"/style/view.less","url":"/style/view.less"}],"js":[{"id":"/.reference/libjs/class/lib/class.js","url":".reference/libjs/class/lib/class.js","namespace":""},{"id":"/.reference/libjs/include/lib/include.js","url":".reference/libjs/include/lib/include.js","namespace":""},{"id":"/include.routes.js","url":"include.routes.js","namespace":""},{"id":"/include.debug.js","url":"include.debug.js","namespace":""},{"id":"/.reference/libjs/mask/lib/mask.js","url":"/.reference/libjs/mask/lib/mask.js","namespace":"lib.mask"},{"id":"/.reference/libjs/compo/lib/compo.js","url":"/.reference/libjs/compo/lib/compo.js","namespace":"lib.compo"},{"id":"/script/test.coffee","url":"/script/test.coffee","namespace":""},{"id":"/script/main.js","url":"script/main.js","namespace":""}]});
;include.setCurrent({ id: '/include.routes.js', namespace: '', url: '/include.routes.js'});
;include.routes({
     "lib": "/.reference/libjs/{0}/lib/{1}.js",
     "framework": "/.reference/libjs/framework/lib/{0}.js",
     "compo": "/.reference/libjs/compos/{0}/lib/{1}.js"
});
;include.readystatechanged(3)
;include.setCurrent({ id: '/include.debug.js', namespace: '', url: '/include.debug.js'});
;(function(){
	
	include.cfg({
		loader: {
			'coffee': {
				lib: 'include/loader/coffee/loader'
			},
			'less': {
				lib: 'include/loader/less/loader'	
			}
		}
	});

}());
;include.readystatechanged(3)
;include.setCurrent({ id: '/.reference/libjs/mask/lib/mask.js', namespace: 'lib.mask', url: '/.reference/libjs/mask/lib/mask.js'});
;console.error('MASK');

;(function (global, document) {

	"use strict";
var
	regexpWhitespace = /\s/g,
	regexpLinearCondition = /([!]?['"A-Za-z0-9_\-\.]+)([!<>=]{1,2})?([^\|&]+)?([\|&]{2})?/g,
	regexpEscapedChar = {
		"'": /\\'/g,
		'"': /\\"/g,
		'{': /\\\{/g,
		'>': /\\>/g,
		';': /\\>/g
	},
	regexpTabsAndNL = /[\t\n\r]{1,}/g,
	regexpMultipleSpaces = / {2,}/g,


	hasOwnProp = {}.hasOwnProperty;
var Helper = {
	extend: function (target, source) {
		var key;

		if (source == null) {
			return target;
		}
		if (target == null) {
			target = {};
		}
		for (key in source) {
			if (hasOwnProp.call(source, key)) {
				target[key] = source[key];
			}
		}
		return target;
	},

	getProperty: function (o, chain) {
		var value = o,
			props,
			key, i, length;

		if (typeof o !== 'object' || chain == null) {
			return o;
		}
		if (typeof chain === 'string') {
			props = chain.split('.');
		}

		for (i = 0, length = props.length; i < length; i++) {
			key = props[i];
			value = value[key];
			if (!value) {
				return value;
			}
		}

		return value;
	},

	templateFunction: function (arr, o) {
		var output = '',
			even = true,
			utility, value, index,
			key, i, length;

		for (i = 0, length = arr.length; i < length; i++) {
			if (even) {
				output += arr[i];
			}
			else {
				key = arr[i];
				value = null;
				index = key.indexOf(':');

				if (~index) {
					utility = index > 0 ? key.substring(0, index).replace(regexpWhitespace, '') : '';
					if (utility === '') {
						utility = 'condition';
					}

					key = key.substring(index + 1);
					value = typeof ValueUtilities[utility] === 'function' ? ValueUtilities[utility](key, o) : null;
				}
				else {
					value = Helper.getProperty(o, key);
				}

				output += value == null ? '' : value;
			}

			even = !even;
		}

		return output;
	}
};

function Template(template) {
	this.template = template;
	this.index = 0;
	this.length = template.length;
}

Template.prototype = {
	next: function () {
		this.index++;
		return this;
	},
	skipWhitespace: function () {
		//regexpNoWhitespace.lastIndex = this.index;
		//var result = regexpNoWhitespace.exec(this.template);
		//if (result){
		//    this.index = result.index;
		//}
		//return this;

		var template = this.template,
			index = this.index,
			length = this.length;

		for (; index < length; index++) {
			if (template.charCodeAt(index) !== 32 /*' '*/) {
				break;
			}
		}

		this.index = index;

		return this;
	},

	skipToChar: function (c) {
		var template = this.template,
			index;

		do {
			index = template.indexOf(c, this.index);
		}
		while (~index && template.charCodeAt(index - 1) !== 92 /*'\\'*/);

		this.index = index;

		return this;
	},

//	skipToAny: function (chars) {
//		var r = regexp[chars];
//		if (r == null) {
//			console.error('Unknown regexp %s: Create', chars);
//			r = (regexp[chars] = new RegExp('[' + chars + ']', 'g'));
//		}
//
//		r.lastIndex = this.index;
//		var result = r.exec(this.template);
//		if (result != null) {
//			this.index = result.index;
//		}
//		return this;
//	},

	skipToAttributeBreak: function () {

//		regexpAttrEnd.lastIndex = ++this.index;
//		var result;
//		do {
//			result = regexpAttrEnd.exec(this.template);
//			if (result != null) {
//				if (result[0] == '#' && this.template.charCodeAt(this.index + 1) === 123) {
//					regexpAttrEnd.lastIndex += 2;
//					continue;
//				}
//				this.index = result.index;
//				break;
//			}
//		} while (result != null)
//		return this;

		var template = this.template,
			index = this.index,
			length = this.length,
			c;
		do {
			c = template.charCodeAt(++index);
			// if c == # && next() == { - continue */
			if (c === 35 && template.charCodeAt(index + 1) === 123) {
				index++;
				c = null;
			}
		}
		while (c !== 46 && c !== 35 && c !== 62 && c !== 123 && c !== 32 && c !== 59 && index < length);
		//while(!== ".#>{ ;");

		this.index = index;

		return this;
	},

	sliceToChar: function (c) {
		var template = this.template,
			index = this.index,
			start = index,
			isEscaped = false,
			value, nindex;

		while ((nindex = template.indexOf(c, index)) > -1) {
			index = nindex;
			if (template.charCodeAt(index - 1) !== 92 /*'\\'*/) {
				break;
			}
			isEscaped = true;
			index++;
		}

		value = template.substring(start, index);

		this.index = index;

		return isEscaped ? value.replace(regexpEscapedChar[c], c) : value;

		//-return this.skipToChar(c).template.substring(start, this.index);
	}

//	,
//	sliceToAny: function (chars) {
//		var start = this.index;
//		return this.skipToAny(chars).template.substring(start, this.index);
//	}
};

function ICustomTag() {
	this.attr = {};
}

ICustomTag.prototype.render = function (values, stream) {
	//-return stream instanceof Array ? Builder.buildHtml(this.nodes, values, stream) : Builder.buildDom(this.nodes, values, stream);
	return Builder.build(this.nodes, values, stream);
};

var CustomTags = (function () {

	var renderICustomTag = ICustomTag.prototype.render;

	function List() {
		this.attr = {};
	}

	List.prototype.render = function (values, container, cntx) {
		var attr = this.attr,
			attrTemplate = attr.template,
			value = Helper.getProperty(values, attr.value),
			nodes,
			template,
			i, length;

		if (!(value instanceof Array)) {
			return container;
		}


		if (attrTemplate != null) {
			template = document.querySelector(attrTemplate).innerHTML;
			this.nodes = nodes = Mask.compile(template);
		}


		if (this.nodes == null) {
			return container;
		}

		//- var fn = Builder[container.buffer != null ? 'buildHtml' : 'buildDom'];

		for (i = 0, length = value.length; i < length; i++) {
			Builder.build(this.nodes, value[i], container, cntx);
		}

		return container;
	};


	function Visible() {
		this.attr = {};
	}

	Visible.prototype.render = function (values, container, cntx) {
		if (!ValueUtilities.out.isCondition(this.attr.check, values)) {
			return container;
		}
		else {
			return renderICustomTag.call(this, values, container, cntx);
		}
	};


	function Binding() {
		this.attr = {};
	}

	Binding.prototype.render = function () {
		// lazy self definition

		var
			objectDefineProperty = Object.defineProperty,
			supportsDefineProperty = false,
			watchedObjects,
			ticker;

		// test for support
		if (objectDefineProperty) {
			try {
				supportsDefineProperty = Object.defineProperty({}, 'x', {get: function () {
					return true;
				}}).x;
			}
			catch (e) {
				supportsDefineProperty = false;
			}
		}
		else {
			if (Object.prototype.__defineGetter__) {
				objectDefineProperty = function (obj, prop, desc) {
					if (hasOwnProp.call(desc, 'get')) {
						obj.__defineGetter__(prop, desc.get);
					}
					if (hasOwnProp.call(desc, 'set')) {
						obj.__defineSetter__(prop, desc.set);
					}
				};

				supportsDefineProperty = true;
			}
		}

		// defining polyfill
		if (!supportsDefineProperty) {
			watchedObjects = [];

			objectDefineProperty = function (obj, prop, desc) {
				var
					objectWrapper,
					found = false,
					i, length;

				for (i = 0, length = watchedObjects.length; i < length; i++) {
					objectWrapper = watchedObjects[i];
					if (objectWrapper.obj === obj) {
						found = true;
						break;
					}
				}

				if (!found) {
					objectWrapper = watchedObjects[i] = {obj: obj, props: {}};
				}

				objectWrapper.props[prop] = {
					value: obj[prop],
					set: desc.set
				};
			};

			ticker = function () {
				var
					objectWrapper,
					i, length,
					props,
					prop,
					propObj,
					newValue;

				for (i = 0, length = watchedObjects.length; i < length; i++) {
					objectWrapper = watchedObjects[i];
					props = objectWrapper.props;

					for (prop in props) {
						if (hasOwnProp.call(props, prop)) {
							propObj = props[prop];
							newValue = objectWrapper.obj[prop];
							if (newValue !== propObj.value) {
								propObj.set.call(null, newValue);
							}
						}
					}
				}

				setTimeout(ticker, 16);
			};

			ticker();
		}


		return (Binding.prototype.render = function (values, container) {
			var
				attrValue = this.attr.value,
				value = values[attrValue];

			objectDefineProperty.call(Object, values, attrValue, {
				get: function () {
					return value;
				},
				set: function (x) {
					container.innerHTML = value = x;
				}
			});

			container.innerHTML = value;
			return container;
		}
			).apply(this, arguments);
	};

	return {
		all: {
			list: List,
			visible: Visible,
			bind: Binding
		}
	};

}());

var ValueUtilities = (function () {
	
	function getAssertionValue(value, model){
		var c = value.charCodeAt(0);
		if (c === 34 || c === 39) /* ' || " */{
			return value.substring(1, value.length - 1);
		} else if (c === 45 || (c > 47 && c < 58)) /* [=] || [number] */{
			return value << 0;
		} else {
			return Helper.getProperty(model, value);
		}
		return '';
	}

	var parseLinearCondition = function (line) {
			var cond = {
					assertions: []
				},
				buffer = {
					data: line.replace(regexpWhitespace, '')
				},
				match, expr;

			buffer.index = buffer.data.indexOf('?');

			if (buffer.index === -1) {
				console.error('Invalid Linear Condition: "?" is not found');
			}


			expr = buffer.data.substring(0, buffer.index);

			while ((match = regexpLinearCondition.exec(expr)) != null) {
				cond.assertions.push({
					join: match[4],
					left: match[1],
					sign: match[2],
					right: match[3]
				});
			}

			buffer.index++;
			parseCase(buffer, cond, 'case1');

			buffer.index++;
			parseCase(buffer, cond, 'case2');

			return cond;
		},
		parseCase = function (buffer, obj, key) {
			var c = buffer.data[buffer.index],
				end = null;

			if (c == null) {
				return;
			}
			if (c === '"' || c === "'") {
				end = buffer.data.indexOf(c, ++buffer.index);
				obj[key] = buffer.data.substring(buffer.index, end);
			} else {
				end = buffer.data.indexOf(':', buffer.index);
				if (end === -1) {
					end = buffer.data.length;
				}
				obj[key] = {
					value: buffer.data.substring(buffer.index, end)
				};
			}
			if (end != null) {
				buffer.index = ++end;
			}
		},
		isCondition = function (con, values) {
			if (typeof con === 'string') {
				con = parseLinearCondition(con);
			}
			var current = false,
				a,
				value1,
				value2,
				i,
				length;

			for (i = 0, length = con.assertions.length; i < length; i++) {
				a = con.assertions[i];
				if (a.right == null) {

					current = a.left.charCodeAt(0) === 33 ? !Helper.getProperty(values, a.left.substring(1)) : !!Helper.getProperty(values, a.left);

					if (current === true) {
						if (a.join === '&&') {
							continue;
						}
						break;
					}
					if (a.join === '||') {
						continue;
					}
					break;
				}

				value1 = getAssertionValue(a.left,values);
				value2 = getAssertionValue(a.right,values);
				switch (a.sign) {
					case '<':
						current = value1 < value2;
						break;
					case '<=':
						current = value1 <= value2;
						break;
					case '>':
						current = value1 > value2;
						break;
					case '>=':
						current = value1 >= value2;
						break;
					case '!=':
						current = value1 !== value2;
						break;
					case '==':
						current = value1 === value2;
						break;
				}

				if (current === true) {
					if (a.join === '&&') {
						continue;
					}
					break;
				}
				if (a.join === '||') {
					continue;
				}
				break;
			}
			return current;
		};

	return {
		condition: function (line, values) {
			var con = parseLinearCondition(line),
				result = isCondition(con, values) ? con.case1 : con.case2;

			if (result == null) {
				return '';
			}
			if (typeof result === 'string') {
				return result;
			}
			return Helper.getProperty(values, result.value);
		},
		out: {
			isCondition: isCondition,
			parse: parseLinearCondition
		}
	};
}());


var Parser = {
	toFunction: function (template) {

		var arr = template.split('#{'),
			length = arr.length,
			i;

		for (i = 1; i < length; i++) {
			var key = arr[i],
				index = key.indexOf('}');
			arr.splice(i, 0, key.substring(0, index));
			i++;
			length++;
			arr[i] = key.substring(index + 1);
		}

		template = null;
		return function (o) {
			return Helper.templateFunction(arr, o);
		};
	},
	parseAttributes: function (T, node) {

		var key, value, _classNames, quote, c, start, i;
		if (node.attr == null) {
			node.attr = {};
		}

		loop: for (; T.index < T.length;) {
			key = null;
			value = null;
			c = T.template.charCodeAt(T.index);
			switch (c) {
				case 32:
					//case 9: was replaced while compiling
					//case 10:
					T.index++;
					continue;

				//case '{;>':
				case 123:
				case 59:
				case 62:
					
					break loop;

				case 46:
					/* '.' */

					start = T.index + 1;
					T.skipToAttributeBreak();

					value = T.template.substring(start, T.index);

					_classNames = _classNames != null ? _classNames + ' ' + value : value;

					break;
				case 35:
					/* '#' */
					key = 'id';

					start = T.index + 1;
					T.skipToAttributeBreak();
					value = T.template.substring(start, T.index);

					break;
				default:
					start = (i = T.index);
					
					var whitespaceAt = null;
					do {
						c = T.template.charCodeAt(++i);
						if (whitespaceAt == null && c === 32){
							whitespaceAt = i;
						}
					}while(c !== 61 /* = */ && i <= T.length);
					
					key = T.template.substring(start, whitespaceAt || i);
					
					do {
						quote = T.template.charAt(++i);
					}
					while (quote === ' ');

					T.index = ++i;
					value = T.sliceToChar(quote);
					T.index++;
					break;
			}


			if (key != null) {
				//console.log('key', key, value);
				if (value.indexOf('#{') > -1) {
					value = T.serialize !== true ? this.toFunction(value) : {
						template: value
					};
				}
				node.attr[key] = value;
			}
		}
		if (_classNames != null) {
			node.attr['class'] = _classNames.indexOf('#{') > -1 ? (T.serialize !== true ? this.toFunction(_classNames) : {
				template: _classNames
			}) : _classNames;

		}
		

	},
	/** @out : nodes */
	parse: function (T) {
		var current = T;
		for (; T.index < T.length; T.index++) {
			var c = T.template.charCodeAt(T.index);
			switch (c) {
				case 32:
					continue;
				case 39:
				/* ' */
				case 34:
					/* " */

					T.index++;

					var content = T.sliceToChar(c === 39 ? "'" : '"');
					if (content.indexOf('#{') > -1) {
						content = T.serialize !== true ? this.toFunction(content) : {
							template: content
						};
					}

					var t = {
						content: content
					};
					if (current.nodes == null) {
						current.nodes = t;
					}
					else if (current.nodes.push == null) {
						current.nodes = [current.nodes, t];
					}
					else {
						current.nodes.push(t);
					}
					//-current.nodes.push(t);

					if (current.__single) {
						if (current == null) {
							continue;
						}
						current = current.parent;
						while (current != null && current.__single != null) {
							current = current.parent;
						}
					}
					continue;
				case 62:
					/* '>' */
					current.__single = true;
					continue;
				case 123:
					/* '{' */

					continue;
				case 59:
					/* ';' */
					/** continue if semi-column, but is not a single tag (else goto 125) */
					if (current.nodes != null) {
						continue;
					}
					/* falls through */
				case 125:
					/* '}' */
					if (current == null) {
						continue;
					}

					do {
						current = current.parent;
					}
					while (current != null && current.__single != null);

					continue;
			}

			var tagName = null;
			if (c === 46 /* . */ || c === 35 /* # */){
				tagName = 'div';
			}else{
				var start = T.index;
				do {
					c = T.template.charCodeAt(++T.index);
				}
				while (c !== 32 && c !== 35 && c !== 46 && c !== 59 && c !== 123 && c !== 62 && T.index <= T.length);
				/** while !: ' ', # , . , ; , { <*/
		
				tagName = T.template.substring(start, T.index);
			}

			if (tagName === '') {
				console.error('Parse Error: Undefined tag Name %d/%d %s', T.index, T.length, T.template.substring(T.index, T.index + 10));
			}

			var tag = {
				tagName: tagName,
				parent: current
			};

			if (current == null) {
				console.log('T', T, 'rest', T.template.substring(T.index));
			}

			if (current.nodes == null) {
				current.nodes = tag;
			}
			else if (current.nodes.push == null) {
				current.nodes = [current.nodes, tag];
			}
			else {
				current.nodes.push(tag);
			}
			//-if (current.nodes == null) current.nodes = [];
			//-current.nodes.push(tag);

			current = tag;

			this.parseAttributes(T, current);

			T.index--;
		}
		return T.nodes;
	},
	cleanObject: function (obj) {
		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				this.cleanObject(obj[i]);
			}
			return obj;
		}
		delete obj.parent;
		delete obj.__single;

		if (obj.nodes != null) {
			this.cleanObject(obj.nodes);
		}

		return obj;
	}
};

var Builder = {
	build: function (nodes, values, container, cntx) {
		if (nodes == null) {
			return container;
		}

		if (container == null) {
			container = document.createDocumentFragment();
		}
		if (cntx == null) {
			cntx = {};
		}

		var isarray = nodes instanceof Array,
			length = isarray === true ? nodes.length : 1,
			i, node;

		for (i = 0; i < length; i++) {
			node = isarray === true ? nodes[i] : nodes;

			if (CustomTags.all[node.tagName] != null) {
				try {
					var Handler = CustomTags.all[node.tagName],
						custom = Handler instanceof Function ? new Handler(values) : Handler;

					custom.compoName = node.tagName;
					custom.nodes = node.nodes;
					/*	creating new attr object for custom handler, preventing collisions due to template caching */
					custom.attr = Helper.extend(custom.attr, node.attr);

					(cntx.components || (cntx.components = [])).push(custom);
					custom.parent = cntx;
					custom.render(values, container, custom);
				}catch(error){
					console.error('Custom Tag Handler:', node.tagName, error);
				}
				continue;
			}
			if (node.content != null) {
				container.appendChild(document.createTextNode(typeof node.content === 'function' ? node.content(values) : node.content));
				continue;
			}

			var tag = document.createElement(node.tagName),
				attr = node.attr;
			for (var key in attr) {
				if (hasOwnProp.call(attr, key) === true){
					var value = typeof attr[key] === 'function' ? attr[key](values) : attr[key];
					if (value) {
						tag.setAttribute(key, value);
					}
				}
			}

			if (node.nodes != null) {
				this.build(node.nodes, values, tag, cntx);
			}
			container.appendChild(tag);
		}
		return container;
	}
};

var cache = {},
	Mask = {

		/**
		 * @arg template - {template{string} | maskDOM{array}}
		 * @arg model - template values
		 * @arg container - optional, - place to renderDOM, @default - DocumentFragment
		 * @return container {@default DocumentFragment}
		 */
		render: function (template, model, container, cntx) {
			//////try {
			if (typeof template === 'string') {
				template = this.compile(template);
			}
			return Builder.build(template, model, container, cntx);
			//////} catch (e) {
			//////	console.error('maskJS', e.message, template);
			//////}
			//////return null;
		},
		/**
		 *@arg template - string to be parsed into maskDOM
		 *@arg serializeDOM - build raw maskDOM json, without template functions - used for storing compiled template
		 *@return maskDOM
		 */
		compile: function (template, serializeOnly) {
			if (hasOwnProp.call(cache, template)){
				/** if Object doesnt contains property that check is faster
					then "!=null" http://jsperf.com/not-in-vs-null/2 */
				return cache[template];
			}


			/** remove unimportant whitespaces */
			var T = new Template(template.replace(regexpTabsAndNL, '').replace(regexpMultipleSpaces, ' '));
			if (serializeOnly === true) {
				T.serialize = true;
			}

			return (cache[template] = Parser.parse(T));


		},
		registerHandler: function (tagName, TagHandler) {
			CustomTags.all[tagName] = TagHandler;
		},
		getHandler: function (tagName) {
			return tagName != null ? CustomTags.all[tagName] : CustomTags.all;
		},
		registerUtility: function (utilityName, fn) {
			ValueUtilities[utilityName] = fn;
		},
		serialize: function (template) {
			return Parser.cleanObject(this.compile(template, true));
		},
		deserialize: function (serialized) {
			var i, key, attr;
			if (serialized instanceof Array) {
				for (i = 0; i < serialized.length; i++) {
					this.deserialize(serialized[i]);
				}
				return serialized;
			}
			if (serialized.content != null) {
				if (serialized.content.template != null) {
					serialized.content = Parser.toFunction(serialized.content.template);
				}
				return serialized;
			}
			if (serialized.attr != null) {
				attr = serialized.attr;
				for (key in attr) {
					if (hasOwnProp.call(attr, key) === true){
						if (attr[key].template == null) {
							continue;
						}
						attr[key] = Parser.toFunction(attr[key].template);
					}
				}
			}
			if (serialized.nodes != null) {
				this.deserialize(serialized.nodes);
			}
			return serialized;
		},
		clearCache: function(key){
			if (typeof key === 'string'){
				delete cache[key];
			}else{
				cache = {};
			}
		},
		ICustomTag: ICustomTag,
		ValueUtils: ValueUtilities
	};


/** Obsolete - to keep backwards compatiable */
Mask.renderDom = Mask.render;


if (typeof module !== 'undefined' && module.exports) {
	module.exports = Mask;
}else{
	global.mask = Mask;
}

})(this, typeof document === 'undefined' ? null : document);
;include.readystatechanged(3)
;include.setCurrent({ id: '/.reference/libjs/compo/lib/compo.js', namespace: 'lib.compo', url: '/.reference/libjs/compo/lib/compo.js'});
;include.js({
	lib: 'mask'
}).done(function() {

	var w = window,
		domLib = typeof $ == 'undefined' ? null : $,
		regexp = {
			trailingSpaces: /^\s+/
		},
		Helper = {
			resolveDom: function(compo, values) {
				if (compo.nodes != null) {
					if (compo.tagName != null) {
						return compo;
					}

					return mask.render(compo.nodes, values);
				}
				if (compo.attr.template != null) {
					var e;
					if (compo.attr.template[0] === '#') {
						e = document.getElementById(compo.attr.template.substring(1));
						if (e == null) {
							console.error('Template Element not Found:', compo.attr.template);
							return null;
						}
					}
					return mask.render(e != null ? e.innerHTML : compo.attr.template, values);
				}
				return null;
			},
			ensureTemplate: function(compo) {
				if (compo.nodes != null) {
					return;
				}

				var template;
				if (compo.attr.template != null) {
					if (compo.attr.template[0] === '#') {
						template = this.templateById(compo.attr.template.substring(1));
					} else {
						template = compo.attr.template;
					}

					delete compo.attr.template;
				}
				if (typeof template == 'string') {
					template = mask.compile(template);
				}
				
				
				
				if (template != null) {
					compo.nodes = template;
					return;
				}

				return;
			},
			templateById: function(id) {
				var e = document.getElementById(id);
				if (e == null) {
					console.error('Template Element not Found:', id);
				}
				return e && e.innerHTML;
			},
			containerArray: function() {
				var arr = [];
				arr.appendChild = function(child) {
					this.push(child);
				};
				return arr;
			},
			parseSelector: function(selector, type, direction) {
				var key, prop, nextKey;

				if (key == null) {
					switch (selector[0]) {
					case '#':
						key = 'id';
						selector = selector.substring(1);
						prop = 'attr';
						break;
					case '.':
						key = 'class';
						selector = new RegExp('\\b' + selector.substring(1) + '\\b');
						prop = 'attr';
						break;
					default:
						key = type == 'node' ? 'tagName' : 'compoName';
						break;
					}
				}

				if (direction == 'up') {
					nextKey = 'parent';
				} else {
					nextKey = type == 'node' ? 'nodes' : 'components';
				}

				return {
					key: key,
					prop: prop,
					selector: selector,
					nextKey: nextKey
				};
			}
		},
		/**
		 *   Component Events. Fires only once.
		 *   Used for component Initialization.
		 *   Supported events:
		 *       DOMInsert
		 *       +custom
		 *   UI-Eevent exchange must be made over DOMLibrary
		 */
		Shots = { /** from parent to childs */
			emit: function(component, event, args) {
				if (component.listeners != null && event in component.listeners) {
					component.listeners[event].apply(component, args);
					delete component.listeners[event];
				}
				if (component.components instanceof Array) {
					for (var i = 0; i < component.components.length; i++) {
						Shots.emit(component.components[i], event, args);
					}
				}
			},
			on: function(component, event, fn) {
				if (component.listeners == null) {
					component.listeners = {};
				}
				component.listeners[event] = fn;
			}
		},
		Events_ = {
			on: function(component, events, $element) {
				if ($element == null) {
					$element = component.$;
				}

				var isarray = events instanceof Array,
					length = isarray ? events.length : 1;

				for (var i = 0, x; isarray ? i < length : i < 1; i++) {
					x = isarray ? events[i] : events;

					if (x instanceof Array) {
						$element.on.apply($element, x);
						continue;
					}


					for (var key in x) {
						var fn = typeof x[key] === 'string' ? component[x[key]] : x[key],
							parts = key.split(':');

						$element.on(parts[0] || 'click', parts.splice(1).join(':').trim() || null, fn.bind(component));
					}
				}
			}
		},
		Children_ = {
			select: function(component, compos) {
				for (var name in compos) {
					var data = compos[name],
						events = null,
						selector = null;

					if (data instanceof Array) {
						selector = data[0];
						events = data.splice(1);
					}
					if (typeof data == 'string') {
						selector = data;
					}
					if (data == null) {
						console.error('Unknown component child', name, compos[name]);
						return;
					}

					var index = selector.indexOf(':'),
						engine = selector.substring(0, index);

					engine = Compo.config.selectors[engine];

					if (engine == null) {
						component.compos[name] = component.$[0].querySelector(selector);
					} else {
						selector = selector.substring(++index).replace(regexp.trailingSpaces, '');
						component.compos[name] = engine(component, selector);
					}

					var element = component.compos[name];

					if (events != null) {
						if (element instanceof Compo) {
							element = element.$;
						}
						Events_.on(component, events, element);
					}
				}
			}
		};

	w.Compo = Class({
		/**
		 * @param - arg -
		 *      1. object - model object, receive from mask.render
		 *      Custom Initialization:
		 *      2. String - template
		 * @param cntx
		 *      1. maskDOM context
		 */
		Construct: function(arg) {
			if (typeof arg === 'string') {
				var template = arg;
				if (template[0] == '#') {
					template = Helper.templateById(template.substring(1));
				}
				this.nodes = mask.compile(template);
			}

		},
		render: function(values, container, cntx) {
			Compo.render(this, values, container, cntx);
			return this;
		},
		insert: function(parent) {
			for (var i = 0; i < this.$.length; i++) {
				parent.appendChild(this.$[i]);
			}

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		append: function(template, values, selector) {
			var parent;
			
			if (this.$ == null) {
				var dom = typeof template == 'string' ? mask.compile(template) : template;
					
				parent = selector ? Compo.findNode(this, selector) : this;
				if (parent.nodes == null) {
					this.nodes = dom;
				} else if (parent.nodes instanceof Array) {
					parent.nodes.push(dom);
				} else {
					parent.nodes = [this.nodes, dom];
				}

				return this;
			}
			var array = mask.render(template, values, Helper.containerArray(), this);
			
			parent = selector ? this.$.find(selector) : this.$;
			for (var i = 0; i < array.length; i++) {
				parent.append(array[i]);
			}

			Shots.emit(this, 'DOMInsert');
			return this;
		},
		on: function() {
			var x = Array.prototype.slice.call(arguments);
			if (arguments.length < 3) {
				console.error('Invalid Arguments Exception @use .on(type,selector,fn)');
				return this;
			}

			if (this.$ != null) {
				Events_.on(this, [x]);
			}


			if (this.events == null) {
				this.events = [x];
			} else if (this.events instanceof Array) {
				this.events.push(x);
			} else {
				this.events = [x, this.events];
			}
			return this;
		},
		remove: function() {
			this.$ && this.$.remove();
			Compo.dispose(this);

			if (this.parent != null) {
				var i = this.parent.components.indexOf(this);
				this.parent.components.splice(i, 1);
			}

			return this;
		},
		Static: {
			render: function(compo, values, container, cntx) {
				if (cntx == null) {
					cntx = compo;
				}
				

				Helper.ensureTemplate(compo);

				var elements = mask.render(compo.tagName == null ? compo.nodes : compo, values, Helper.containerArray(), cntx);
				compo.$ = domLib(elements);

				if (compo.events != null) {
					Events_.on(compo, compo.events);
				}
				if (compo.compos != null) {
					Children_.select(compo, compo.compos);
				}

				if (container != null) {
					for (var i = 0; i < elements.length; i++) {
						container.appendChild(elements[i]);
					}
				}
				return this;
			},
			config: {
				selectors: {
					'$': function(compo, selector) {
						var r = compo.$.find(selector);
						return r.length > 0 ? r : compo.$.filter(selector);
					},
					'compo': function(compo, selector) {
						var r = Compo.findCompo(compo, selector);
						return r;
					}
				},
				/**
				 @default, global $ is used
				 IDOMLibrary = {
				 {fn}(elements) - create dom-elements wrapper,
				 on(event, selector, fn) - @see jQuery 'on'
				 }
				 */
				setDOMLibrary: function(lib) {
					domLib = lib;
				}
			},
			match: function(compo, selector, type) {
				if (typeof selector === 'string') {
					if (type == null) {
						type = compo.compoName ? 'compo' : 'node';
					}
					selector = Helper.parseSelector(selector, type);
				}

				var obj = selector.prop ? compo[selector.prop] : compo;
				if (obj == null) {
					return false;
				}

				if (selector.selector.test != null) {
					if (selector.selector.test(obj[selector.key])) {
						return true;
					}
				} else {
					if (obj[selector.key] == selector.selector) {
						return true;
					}
				}

				return false;
			},
			find: function(compo, selector, direction, type) {
				if (compo == null || typeof compo === 'string') {
					console.warn('Invalid Compo', arguments);
					return null;
				}

				if (typeof selector === 'string') {
					if (type == null) {
						type = compo.compoName ? 'compo' : 'node';
					}
					selector = Helper.parseSelector(selector, type, direction);
				}
				if (compo instanceof Array) {
					for (var i = 0, x, length = compo.length; i < length; i++) {
						x = compo[i];
						var r = Compo.find(x, selector);
						if (r != null) {
							return r;
						}
					}
					return null;
				}
				if (Compo.match(compo, selector) === true) {
					return compo;
				}
				return (compo = compo[selector.nextKey]) && Compo.find(compo, selector);
			},
			findCompo: function(compo, selector, direction) {
				return Compo.find(compo, selector, direction, 'compo');

			},
			findNode: function(compo, selector, direction) {
				return Compo.find(compo, selector, direction, 'node');
			},
			dispose: function(compo) {
				compo.dispose && compo.dispose();
				if (this.components == null) {
					return;
				}
				for (var i = 0, length = compo.components.length; i < length; i++) {
					Compo.dispose(compo.components[i]);
				}
			},
			shots: Shots
		}
	});

	/** CompoUtils */
	var Traversing = {
		find: function(selector, type) {
			return Compo.find(this, selector, null, type || 'compo');
		},
		closest: function(selector, type) {
			return Compo.find(this, selector, 'up', type || 'compo');
		},
		all: function(selector, type) {
			var current = arguments[2] || this,
				arr = arguments[3] || [];

			if (typeof selector === 'string') {
				selector = Helper.parseSelector(selector, type);
			}


			if (Compo.match(current, selector)) {
				arr.push(current);
			}

			var childs = current[selector.nextKey];

			if (childs != null) {
				for (var i = 0; i < childs.length; i++) {
					this.all(selector, null, childs[i], arr);
				}
			}

			return arr;
		}
	};

	var Manipulate = {
		addClass: function(_class) {
			this.attr['class'] = this.attr['class'] ? this.attr['class'] + ' ' + _class : _class;
		}
	};

	w.CompoUtils = Class({
		Extends: [Traversing, Manipulate]
	});

});

;include.readystatechanged(3)
;include.setCurrent({ id: '/script/test.coffee', namespace: '', url: '/script/test.coffee'});
;(function() {

  window.testLog = function(x) {
    return console.log(x);
  };

}).call(this);

;include.readystatechanged(3)
;include.setCurrent({ id: '/script/main.js', namespace: '', url: '/script/main.js'});
;console.log('inMain');
include.js({
	lib: 'compo',
	'': '/script/test.coffee'
}).css('/style/view.less').done(function(){
	window.testLog('Privet');

	//new Compo('#layout').render().insert(document.body);
	
});
;include.readystatechanged(3)