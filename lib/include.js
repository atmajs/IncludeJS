
;(function(global, document) {

	"use strict";
	
	


var cfg = {},
	bin = {},
	isWeb = !! (global.location && global.location.protocol && /^https?:/.test(global.location.protocol)),
	handler = {},
	regexpName = /\{name\}/g,
	hasOwnProp = {}.hasOwnProperty,
	rewrites = typeof IncludeRewrites != 'undefined' ? IncludeRewrites : null,
	currentParent = null,
	__eval = function(source, include) {
		if (!source) console.error('error', include);
		return eval(source);
	};

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
	extend: function(target, source) {
		for (var key in source) {
			target[key] = source[key];
		}
		return target;
	},
	/**
	 *	@arg x :
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
	eachIncludeItem: function(type, x, fn, namespace, xpath) {
		var key;
		
		if (x == null) {
			console.error('Include Item has no Data', type, namespace);
			return;
		}

		if (type == 'lazy' && xpath == null) {
			for (key in x) {
				this.eachIncludeItem(type, x[key], fn, null, key);
			}
			return;
		}
		if (x instanceof Array) {
			for (var i = 0; i < x.length; i++) {
				this.eachIncludeItem(type, x[i], fn, namespace, xpath);
			}
			return;
		}
		if (typeof x === 'object') {
			for (key in x) {
				this.eachIncludeItem(type, x[key], fn, key, xpath);
			}
			return;
		}

		if (typeof x === 'string') {
			var route = namespace && cfg[namespace];
			if (route) {
				namespace += '.' + x;
				x = route.replace(regexpName, x);
			}
			fn(namespace, x, xpath);
			return;
		}

		console.error('Include Package is invalid', arguments);
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
var Events = (function(document) {
	if (document == null) {
		return {
			ready: Helper.doNothing,
			load: Helper.doNothing
		};
	}
	var readycollection = [],
		loadcollection = null,
		readyqueue = null,
		timer = Date.now();

	document.onreadystatechange = function() {
		if (/complete|interactive/g.test(document.readyState) === false) {
			return;
		}
		if (timer) {
			console.log('DOMContentLoader', document.readyState, Date.now() - timer, 'ms');
		}
		Events.ready = (Events.readyQueue = Helper.doNothing);


		Helper.invokeEach(readyqueue);

		Helper.invokeEach(readycollection);
		readycollection = null;
		readyqueue = null;


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
		readyQueue: function(callback) {
			(readyqueue || (readyqueue = [])).push(callback);
		},
		load: function(callback) {
			(loadcollection || (loadcollection = [])).unshift(callback);
		}
	};
})(document);
var IncludeDeferred = Class({
	Construct: function() {
		this.callbacks = [];
	},

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
		var r = callback(this.response);
		if (r != null) {
			this.obj = r;
		}
	}
});
var Include = Class({
	setCurrent: function(data) {
		currentParent = data;
	},
	incl: function(type, pckg) {

		if (this instanceof Resource) {
			return this.include(type, pckg);
		}

		var r = new Resource();

		if (currentParent) {
			r.id = currentParent.id;
			r.url = currentParent.url;
			r.namespace = currentParent.namespace;
			r.location = Helper.uri.getDir(r.url);
			//-currentParent = null;
		}
		return r.include(type, pckg);
		//-return (this instanceof Resource ? this : new Resource).include(type, pckg);
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
					var container = document.querySelector('script[data-id="' + id + '"]');
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
});

var loadScript = function(url, callback){
	//console.log('load script', url);
	var tag = document.createElement('script');
	tag.type = 'application/javascript';
	tag.src = url;
	tag.onload = callback;
	tag.onerror = callback;
	document.querySelector('head').appendChild(tag);

}

var isEvalEnabled = true; 

var ScriptStack = new(Class({

	Construct: function() {
		this.stack = [];
	},

	load: function(resource, parent) {
		var _this = this;

		//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');
		
		var add = false;
		if (parent){
			
			for(var i = 0, x, length = this.stack.length; i<length; i++){				
				x = this.stack[i];
				
				if (x == parent){
					//console.warn('parent', x.url);
					this.stack.splice(i,0, resource);
					add = true;
					break;
				}				
			}
			
		}
		
		if (!add){
			//console.log('push to stack', resource.url, resource.parent);
			this.stack.push(resource);
		}
		
		if (isEvalEnabled){
			Helper.xhr(resource.url, function(url, response) {
				if (!response) console.error('no resp', resource);
				resource.source = response;
	
				resource.readystatechanged(3);
				
				_this.process();
			});	
		}
		else{
			this.loadByEmbedding();
		}
		

		
	},
	
	loadByEmbedding: function(){
		if (this.stack.length == 0) {
			console.log('GG', global.include.url);
			return;
		}
		
		var resource = this.stack[0];
		
		
		
		if (resource.state == 1) {
			return;
		}
		
		//console.log('before load: state:', resource.state, resource.url);
		resource.state = 1;
		
		global.include = resource;
		loadScript(resource.url, function(e){
			
			//console.log('loadED script', resource.url);
			for(var i = 0, x, length = this.stack.length; i<length; i++){
				x = this.stack[i];
				if (x == resource) {
					this.stack.splice(i,1);
					
					break;
				}
				
			}
			
			
			
			resource.state = 3;
			resource.onload(resource.url, ' ');
			
			this.loadByEmbedding();
		}.bind(this));
		
	},

	process: function() {
		var resource = this.stack[0];

		//console.log('process', resource.url, resource.state);
		if (resource && resource.state > 2) {
			resource.state = 0;

			//console.log('evaling', resource.url, this.stack.length);			
			try {
				__eval(resource.source, resource);
			} catch (error) {
				error.url = resource.url;
				Helper.reportError(error);
			}


			

			
			for(var i = 0, x, length = this.stack.length; i<length; i++){
				x = this.stack[i];
				if (x == resource) {
					this.stack.splice(i,1);
					break;
				}
				
			}
			
			
			resource.state = 3;
			resource.onload(resource.url, resource.source);
			this.process();
		}
	}
	

}))();
var Resource = Class({
	Base: Include,
	Extends: IncludeDeferred,
	Construct: function(type, url, namespace, xpath, parent, id) {

		if (type == null) {
			return this;
		}



		this.namespace = namespace;
		this.type = type;
		this.xpath = xpath;
		this.url = url;

		if (url != null) {
			this.url = Helper.uri.resolveUrl(url, parent);
		}


		if (!id) {
			if (namespace) {
				id = namespace;
			}
			else if (url[0] == '/') {
				id = url;
			}
			else if (parent && parent.namespace) {
				id = parent.namespace + '/' + url;
			}
			else if (parent && parent.location) {
				id = '/' + parent.location.replace(/^[\/]+/, '') + url;
			}
			else if (parent && parent.id) {
				id = parent.id + '/' + url;
			}
			else {
				id = '/' + url;
			}		
		}

		if (bin[type] && bin[type][id]) {
			return bin[type][id];
		}
		
		window.bin = bin;
		

		if (rewrites != null && rewrites[id] != null) {
			url = rewrites[id];
		} else {
			url = this.url;
		}

		//console.log('created:', this.url);
		this.location = Helper.uri.getDir(url);

		//-console.log('includejs. Load Resource:', id, url);


		
		(bin[type] || (bin[type] = {}))[id] = this;

		var tag;
		switch (type) {
		case 'js':
			
			ScriptStack.load(this, parent);
			
			//Helper.xhr(url, this.onload.bind(this));
			if (document != null) {
				//tag = document.createElement('script');
				//tag.type = "application/x-included-placeholder";
				//tag.src = url;
			}
			break;
		case 'ajax':
		case 'load':
		case 'lazy':
			Helper.xhr(url, this.onload.bind(this));
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
			tag.onload = function() {
				this.readystatechanged(4);
			}.bind(this);
			tag.onerror = tag.onload;
			break;
		}
		if (tag != null) {
			document.querySelector('head').appendChild(tag);
			tag = null;
		}
		return this;
	},
	include: function(type, pckg) {
		this.state = 0;
		if (this.includes == null) {
			this.includes = [];
		}


		Helper.eachIncludeItem(type, pckg, function(namespace, url, xpath) {
			var resource = new Resource(type, url, namespace, xpath, this);

			this.includes.push(resource);

			resource.index = this.calcIndex(type, namespace);
			resource.on(4, this.resourceLoaded.bind(this));
		}.bind(this));

		return this;
	},
	calcIndex: function(type, namespace) {
		if (this.response == null) {
			this.response = {};
		}
		switch (type) {
		case 'js':
		case 'load':
		case 'ajax':
			if (this.response[type + 'Index'] == null) {
				this.response[type + 'Index'] = -1;
			}
			return ++this.response[type + 'Index'];
		}
		return -1;
	},
	wait: function(){
		return this;
	},
	////wait: function() {
	////	if (this.waits == null) this.waits = [];
	////	if (this._include == null) this._include = this.include;
	////
	////	var data;
	////
	////	this.waits.push((data = []));
	////	this.include = function(type, pckg) {
	////		data.push({
	////			type: type,
	////			pckg: pckg
	////		});
	////		return this;
	////	}
	////	return this;
	////},
	resourceLoaded: function(resource) {
		//if (this.parsing) {
		//	return;
		//}


		if (resource != null && resource.obj != null && resource.obj instanceof Include === false) {
			
			switch (resource.type) {
			case 'js':
			case 'load':
			case 'ajax':
				
				if (this.response == null) this.response = {};
				
				var obj = (this.response[resource.type] || (this.response[resource.type] = []));

				if (resource.namespace != null) {
					obj = Helper.ensureArray(obj, resource.namespace);
				}
				obj[resource.index] = resource.obj;
				break;
			}
		}

		if (this.includes != null && this.includes.length) {
			for (var i = 0; i < this.includes.length; i++) {
				if (this.includes[i].state != 4) {
					return;
				}
			}
		}


		//////if (this.waits && this.waits.length) {
		//////
		//////	var data = this.waits.shift();
		//////	this.include = this._include;
		//////	for (var i = 0; i < data.length; i++) this.include(data[i].type, data[i].pckg);
		//////	return;
		//////}

		//console.log('READY', this.url, this.url == null ? this : '');
		this.readystatechanged((this.state = 4));

	},

	onload: function(url, response) {
		if (!response) {
			console.warn('Resource cannt be loaded', this.url);
			this.readystatechanged(4);
			return;
		}

		switch (this.type) {
		case 'load':
		case 'ajax':
			this.obj = response;
			break;
		case 'lazy':
			LazyModule.create(this.xpath, response);
			break;
		case 'js':
			//this.parsing = true;
			////try {
			////	__eval(response, this);
			////} catch (error) {
			////	error.url = this.url;
			////	Helper.reportError(error);
			////}
			break;
		}

		//this.parsing = false;

		this.resourceLoaded(this);

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
					if (r != null && r instanceof Resource === false){
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
global.include.helper = Helper;
global.IncludeResource = Resource;

})(this,document);