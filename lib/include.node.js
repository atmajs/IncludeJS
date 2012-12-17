
var __eval = function(source, include) {
	"use strict";
	if (!source) {
		console.error('error', include);
	}
	var iparams = include.route.params;
	return eval(source);
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
			switch (url.substring(0, 4)) {
			case 'file':
			case 'http':
				return url;
			}

			if (parent != null && parent.location != null) {
				return parent.location + url;
			}
			return url;
		}
	},
	extend: function(target) {
		for(var i = 1; i< arguments.length; i++){
			var source = arguments[i];
			if (typeof source === 'function'){
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
				if (typeof x === 'function'){
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
};
var Routes = (function() {

	var routes = {};

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
		}
	};
	
})();


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
		this.state = state;
		for (var i = 0, x, length = this.callbacks.length; i < length; i++) {
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
		global.include = this;		
		callback(this.response);		
	}
};
var Include = function(){};
Include.prototype = {
	setCurrent: function(resource) {
		
		var r = new Resource('js', {path: resource.id}, resource.namespace, null, null, resource.id);
		if (r.state != 4){
			console.error("Current Resource should be loaded");
		}
		
		global.include = r;
		
	},
	incl: function(type, pckg) {

		if (this instanceof Resource) {
			return this.include(type, pckg);
		}

		var r = new Resource();
		//
		//if (currentParent) {
		//	r.id = currentParent.id;
		//	r.url = currentParent.url;
		//	r.namespace = currentParent.namespace;
		//	r.location = Helper.uri.getDir(r.url);			
		//}
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
					var container = document.querySelector('#includejs-' + id);
					if (container == null) {
						console.error('"%s" Data was not embedded into html', id);
						return;
					}
					resource.obj = container.innerHTML;						
					break;
				}
				(bin[key] || (bin[key] = {}))[id] = resource;
			}
		}
	}
};
var ScriptStack = (function() {

	var head, currentResource, stack = [],
		loadScript = function(url, callback) {
			//console.log('load script', url);
			var tag = document.createElement('script');
			tag.type = 'application/javascript';
			tag.src = url;
			tag.onload = tag.onerror = callback;

			(head || (head = document.querySelector('head'))).appendChild(tag);
		},
		afterScriptRun = function(resource) {
			var includes = resource.includes;

			if (includes != null && includes.length) {
				for (var i = 0; i < includes.length; i++) {
					if (includes[i].state != 4) {
						return;
					}
				}
			}			
			
			resource.readystatechanged(4);
		},
		loadByEmbedding = function() {
			if (stack.length === 0) {
				return;
			}

			if (currentResource != null){
				return;
			}


			var resource = (currentResource = stack[0]);

			if (resource.state === 1) {
				return;
			}

			resource.state = 1;

			global.include = resource;
			
			
			global.iparams = resource.route.params;
			
			
			loadScript(resource.url, function(e) {
				if (e.type == 'error'){
					console.log('Script Loaded Error', resource.url);					
				}
				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === resource) {
						stack.splice(i, 1);
						break;
					}
				}
				resource.state = 3;
				afterScriptRun(resource);

				currentResource = null;
				loadByEmbedding();
			});
		},
		processByEval = function() {
			if (stack.length === 0){
				return;
			}
			if (currentResource != null){
				return;
			}

			var resource = stack[0];
			if (resource && resource.state > 2) {
				currentResource = resource;
				resource.state = 1;

				//console.log('evaling', resource.url, stack.length);			
				try {
					__eval(resource.source, resource);
				} catch (error) {
					error.url = resource.url;
					Helper.reportError(error);
				}
				for (var i = 0, x, length = stack.length; i < length; i++) {
					x = stack[i];
					if (x == resource) {
						stack.splice(i, 1);
						break;
					}
				}
				resource.state = 3;
				afterScriptRun(resource);

				currentResource = null;
				processByEval();
			}
		};


	return {
		load: function(resource, parent) {

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

			if (cfg.eval) {
				Helper.xhr(resource.url, function(url, response) {
					if (!response) {
						console.error('Not Loaded:', url);
					}

					resource.source = response;
					resource.readystatechanged(3);
					//	process next
					processByEval();
				});
			} else {
				loadByEmbedding();
			}

		},
		afterScriptRun: afterScriptRun
	};
})();
var Resource = function(type, route, namespace, xpath, parent, id) {
		Include.call(this);
		IncludeDeferred.call(this);

		////if (type == null) {
		////	this.state = 3;
		////	return this;
		////}
		
		var url = route && route.path;
		
		if (url != null) {
			this.url = url = Helper.uri.resolveUrl(url, parent);
		}
		
		this.route = route;
		this.namespace = namespace;
		this.type = type;
		this.xpath = xpath;
		
		
		
		if (id == null && url){
			id = (url[0] == '/' ? '' : '/') + url;
		}
		
		
		var resource = bin[type] && bin[type][id];		
		if (resource) {
			resource.route = route;			
			return resource;
		}
		
		if (url == null){
			this.state = 3;
			return this;
		}
		
		
		this.location = Helper.uri.getDir(url);



		(bin[type] || (bin[type] = {}))[id] = this;

		var tag;
		switch (type) {
		case 'js':
			ScriptStack.load(this, parent);
			
			break;
		case 'ajax':
		case 'load':
		case 'lazy':
			Helper.xhr(url, this.onXHRLoaded.bind(this));
			break;
		case 'css':
			this.state = 4;

			tag = document.createElement('link');
			tag.href = url;
			tag.rel = "stylesheet";
			tag.type = "text/css";
			break;
		case 'embed':
			tag = document.createElement('script');
			tag.type = 'application/javascript';
			tag.src = url;
			tag.onload = tag.onerror = this.readystatechanged.bind(this, 4);			
			break;
		}
		if (tag != null) {
			document.querySelector('head').appendChild(tag);
			tag = null;
		}
		return this;
	};

Resource.prototype = Helper.extend({}, IncludeDeferred, Include, {
	include: function(type, pckg) {
		//-this.state = 1;
		this.state = this.state >= 3 ? 3 : 1;

		if (this.includes == null) {
			this.includes = [];
		}


		Routes.each(type, pckg, function(namespace, route, xpath) {
			var resource = new Resource(type, route, namespace, xpath, this);

			this.includes.push(resource);

			resource.index = this.calcIndex(type, namespace);
			resource.on(4, this.childLoaded.bind(this));
		}.bind(this));

		return this;
	},
	/** Deprecated
	 *	Use Resource Alias instead
	 */
	calcIndex: function(type, namespace) {
		if (this.response == null) {
			this.response = {};
		}
		switch (type) {
		case 'js':
		case 'load':
		case 'ajax':
			var key = type + 'Index';
			if (this.response[key] == null) {
				this.response[key] = -1;
			}
			return ++this.response[key];
		}
		return -1;
	},

	childLoaded: function(resource) {


		if (resource && resource.exports) {

			switch (resource.type) {
			case 'js':
			case 'load':
			case 'ajax':

				//////if (this.response == null) {
				//////	this.response = {};
				//////}
				
				if (resource.route.alias){
					this.response[resource.route.alias] = resource.exports;
					break;
				}

				var obj = (this.response[resource.type] || (this.response[resource.type] = []));

				if (resource.namespace != null) {
					obj = Helper.ensureArray(obj, resource.namespace);
				}
				obj[resource.index] = resource.exports;
				break;
			}
		}

		var includes = this.includes;
		if (includes && includes.length) {
			if (this.state < 3/* && this.url != null */){
				/** resource still loading/include is in process, but one of sub resources are already done */
				return;
			}
			for (var i = 0; i < includes.length; i++) {
				if (includes[i].state != 4) {
					return;
				}
			}
		}

		this.readystatechanged(4);

	},

	onXHRLoaded: function(url, response) {
		if (response) {
			switch (this.type) {
			case 'load':
			case 'ajax':
				this.exports = response;
				break;
			case 'lazy':
				LazyModule.create(this.xpath, response);
				break;
			}
			
		} else {
			console.warn('Resource cannt be loaded', this.url);
		}

		this.readystatechanged(4);
	}

});
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

global.include = new Include();

global.includeLib = {
	Helper: Helper,
	Routes: Routes,
	Resource: Resource,
	ScriptStack: ScriptStack
};
var fs = require('fs');
 	
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
				throw err;			
			}
			that.readyState = 4;
			that.responseText = data;
			that.onreadystatechange();			
		});
	}
};


})(typeof window === 'undefined' ? global : window, typeof document == 'undefined' ? null : document);