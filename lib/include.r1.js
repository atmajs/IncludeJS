;
void

function(w, d) {
	//////- var IncludeInstance = (function() {
	var cfg = {},
		bin = {},
		isWeb = !! (w.location && w.location.protocol && /^https?:/.test(w.location.protocol)),
		handler = {},
		regexp = {
			name : new RegExp('\\{name\\}', 'g')
		},
		helper = {			
			/** TODO: improve url handling*/
			uri: {
				getDir: function(url) {
					var index = url.lastIndexOf('/');
					return index == -1 ? '' : url.substring(index + 1, -index);
				},
				/** @obsolete */
				resolveCurrent: function(collection) {
					if (collection.location != null) return collection.location;
					var scripts = d.querySelectorAll('script');
					return scripts[scripts.length - 1].getAttribute('src');
				},
				resolveUrl: function(url, parent) {
					if (url[0] == '/') {
						if (isWeb == false || cfg.lockedToFolder == true) return url.substring(1);
						return url;
					}
					switch (url.substring(0, 4)) {
					case 'file':
					case 'http':
						return url;
					}

					if (parent != null && parent.location != null) return parent.location + url;
					return url;
				}
			},
			isArray: function(value) {
				//- return value && value.toString && value.toString() == '[object Array]';
				return value != null && typeof value === 'object' && value.splice != null;
			},
			extend: function(target, source) {
				for (var key in source) target[key] = source[key];
				return target;
			},
			each: function(arr, fn) {
				if (arr == null) return;
				if (helper.isArray(arr)) for (var i = 0; i < arr.length; i++) fn(arr[i], i);
				else fn(arr, 0);
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
				if (x == null) {
					console.error('Include Item has no Data', type, namespace);
					return;
				}
				
				if (type == 'lazy' && xpath == null) {
					for (var key in x) {
						this.eachIncludeItem(type, x[key], fn, null, key);						
					}
				} else if (x instanceof Array) {
					for (var i = 0; i < x.length; i++) this.eachIncludeItem(type, x[i], fn, namespace, xpath);
				} else if (typeof x == 'string') {
					var route = namespace && include.cfg(namespace);
					if (route) {
						namespace += '.' + x;
						x = route.replace(regexp.name, x);
					}
					fn(namespace, x, xpath);

				} else if (typeof x == 'object') {
					for (var key in x) this.eachIncludeItem(type, x[key], fn, key, xpath);
				} else {
					console.error('Include Package is invalid', arguments);
				}
			},
			invokeEach: function(arr, args) {
				this.each(arr, function(x, index) {
					if (typeof x === 'function')(args != null ? x.apply(this, args) : x());
				});
			},
			count: function(arr) {
				return helper.isArray(arr) ? arr.length : (arr == null ? 0 : 1);
			},
			doNothing: function(fn) {
				typeof fn == 'function' && fn()
			},
			empty: {},
			reportError: function(e) {
				console.error('IncludeJS Error:', e, e.message, e.url);
				typeof handler.onerror == 'function' && handler.onerror(e);
			},
			ensureArray: function(obj, xpath) {
				if (!xpath) return obj;
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
				}
				xhr.open('GET', url, true);
				xhr.send();
			}
		},

		events = (function(w, d) {
			if (d == null) {
				return {
					ready: helper.doNothing,
					load: helper.doNothing
				};
			}
			var readycollection = [],
				loadcollection = [],
				timer = Date.now();

			d.onreadystatechange = function() {
				if (/complete|interactive/g.test(d.readyState) == false) return;

				if (timer) console.log('DOMContentLoader', d.readyState, Date.now() - timer, 'ms');
				events.domReady = true;
				events.ready = helper.doNothing;

				if (events.invokeOnReady != null) {
					events.invokeOnReady();
					delete events.invokeOnReady;
				}

				try {
					helper.invokeEach(readycollection);
				} catch (error) {
					console.error('IncludeJS.events.onready', error);
				} finally {
					readycollection = null;
				}
				if (d.readyState == 'complete') {
					events.load = helper.doNothing;
					helper.invokeEach(loadcollection);
					loadcollection = null;
				}
			};
			return {
				ready: function(callback) {
					readycollection.unshift(callback);
				},
				load: function(callback) {
					loadcollection.unshift(callback);
				}
			}
		})(w, d);

	
	var IncludeDeferred = Class({
		Construct: function() {
			this.dfrCallbacks = {};
		},
		ready: function(callback) {
			this.dfrCallbacks.ready = callback;
			return this.resolve();
		},
		/** assest loaded and window is loaded */
		loaded: function(callback) {
			this.dfrCallbacks.load = callback;
			return this.resolve();
		},
		/** assest loaded */
		done: function(callback) {
			this.dfrCallbacks.done = callback;
			return this.resolve();
		},
		resolve: function() {
			if (this.state < 4) return this;
			var response;
			for (var key in this.dfrCallbacks) {
				if (response == null) response = this.buildResponse();
				var callback = this.dfrCallbacks[key];
				delete this.dfrCallbacks[key];

				if (typeof events[key] != 'function') {
					callback.apply(this, [response]);					
				} else {
					events[key](callback.bind(this, response));
				}
				if (this.state < 4) return this;
			}
			return this;
		}
	});


	var StateObservable = Class({
		Construct: function() {
			this.state = 0;
			this.callbacks = [];
		},
		on: function(state, callback) {
			state <= this.state ? callback(this) : this.callbacks.unshift({
				state: state,
				callback: callback
			});
		},
		readystatechanged: function(state) {
			this.state = state;
			helper.each(this.callbacks, function(x, index) {
				if (x.state > state || x.callback == null) return;
				x.callback(this);
				x.callback = null;
			}.bind(this));
		}
	});

	var Include = Class({
		incl: function(type, pckg) {
			return (this instanceof ResCollection ? this : new ResCollection(this)).process(type, pckg);
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
				var params = arg;
				for (var key in params) cfg[key] = params[key];
				break;
			case 'string':
				if (arguments.length == 1) return cfg[arg];
				if (arguments.length == 2) cfg[arg] = arguments[1];
				break;
			case 'undefined':
				return cfg;
			}
			return this;
		},
		promise: function(namespace) {
			var arr = namespace.split('.'),
				obj = window;
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

					if (url) {
						if (url[0] == '/') url = url.substring(1);
						resource.location = helper.uri.getDir(url);
					}
					if (namespace) {
						resource.namespace = namespace;
					}

					switch (key) {
					case 'load':
					case 'lazy':
						resource.state = 0;
						void

						function(_r, _id) {
							events.invokeOnReady = function() {
								var container = d.querySelector('script[data-appuri="' + _id + '"]');
								if (container == null) {
									console.error('"%s" Data was not embedded into html', _id);
									return;
								}
								_r.obj = container.innerHTML;
								_r.readystatechanged(4);
							};
						}(resource, id);
						break;
					};
					(bin[key] || (bin[key] = {}))[id] = resource;
				}
			}
		}
	});

	window.bin = bin;

	var hasRewrites = typeof IncludeRewrites != 'undefined',
		rewrites = hasRewrites ? IncludeRewrites : null;


	var Resource = Class({
		Base: Include,
		Extends: StateObservable,
		Construct: function(type, url, namespace, xpath, parent, id) {


			if (type == null) {
				return this;
			}

			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;


			this.url = url;
			if (url != null) {
				//if (url[0] == '/') { 
				//	if (isWeb == false || cfg.lockedToFolder == true) this.url = url.substring(1);
				//} else {
				//	if (parent && parent.location) this.url = parent.location + url;
				//}
				this.url = helper.uri.resolveUrl(url, parent);

			}


			if (id) void(0);
			else if (namespace) id = namespace;
			else if (url[0] == '/') id = url;
			else if (parent && parent.namespace) id = parent.namespace + '/' + url;
			else if (parent && parent.location) id = '/' + parent.location.replace(/^[\/]+/, '') + url;
			else id = '/' + url;

			if (bin[type] && bin[type][id]) {
				return bin[type][id];
			}


			if (hasRewrites == true && rewrites[id] != null) {
				url = rewrites[id];
			} else {
				url = this.url;
			}



			console.log('includejs. Load Resource:', id, url);


			;
			(bin[type] || (bin[type] = {}))[id] = this;


			var tag;
			switch (type) {
			case 'js':
				helper.xhr(url, this.onload.bind(this));
				if (d != null){
					tag = d.createElement('script');
					tag.type = "application/x-included-placeholder";
					tag.src = url;
				}
				break;
			case 'ajax':
			case 'load':
			case 'lazy':
				helper.xhr(url, this.onload.bind(this));
				break;
			case 'css':
				this.state = 4;

				tag = d.createElement('link');
				tag.href = url;
				tag.rel = "stylesheet";
				tag.type = "text/css";
				break;
			case 'embed':
				tag = d.createElement('script');
				tag.type = 'application/javascript';
				tag.src = url;
				tag.onload = function() {
					this.readystatechanged(4);
				}.bind(this);
				tag.onerror = tag.onload;
				break;
			}
			if (tag != null) {
				d.querySelector('head').appendChild(tag);
				tag = null;
			}
			return this;
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
			case 'css':
				this.readystatechanged(4);
				return;
			case 'lazy':
				LazyModule.create(this.xpath, response);
				this.readystatechanged(4);
				return;
			};

			this.location = helper.uri.getDir(url);

			var include = this;
			try {
				this.obj = __includeEval(response, this);
			} catch (error) {
				error.url = this.url;
				helper.reportError(error);
			} finally {
				include = window.include;
				response = null;
			}

			//console.log('resource', this.url, this.rescollection);
			if (this.rescollection != null) {
				//this.readystatechanged(3);
				this.rescollection.on(4, function() {
					this.readystatechanged(4);
				}.bind(this))
			} else {
				this.readystatechanged(4);
			}
		}

	});



	var ResCollection = Class({
		Base: Include,
		Extends: [IncludeDeferred, StateObservable],
		Construct: function(parent) {
			if (parent instanceof Resource) {
				parent.rescollection = this;
				this.parent = parent;
			}

			//////if (this.location == null){
			//////	this.location = helper.uri.resolveCurrent(this);
			//////}

			this.includes = [];
			this.response = {};
		},
		index: function(type, namespace) {
			switch (type) {
			case 'js':
			case 'load':
			case 'ajax':
				if (this.response[type + 'Index'] == null) this.response[type + 'Index'] = -1;
				return ++this.response[type + 'Index'];
			}
			return -1;
		},
		process: function(type, data) {
			this.state = 0;
			this._isresolved = false;

			helper.eachIncludeItem(type, data, function(namespace, url, xpath) {

				//url = helper.uri.resolveUrl(url, this.location);

				var resource = new Resource(type, url, namespace, xpath, this.parent),
					info = {
						res: resource,
						index: this.index(type, namespace),
						namespace: namespace
					};

				this.includes.push(info);
				resource.on(4, this.resourceLoaded.bind(this));
			}.bind(this));

			return this;
		},
		wait: function() {
			if (this._process == null) this._process = this.process;

			var _this = this,
				_process = this._process,
				data = [];
			this.process = function(type, pckg) {
				data.push({
					type: type,
					pckg: pckg
				});
				return this;
			}
			return this.done(function() {
				_this.process = _process;
				for (var i = 0; i < data.length; i++) _process.call(_this, data[i].type, data[i].pckg);
			});
		},
		resourceLoaded: function(resource) {
			for (var i = 0; i < this.includes.length; i++) if (this.includes[i].res.state != 4) return;
			this.state = 4;
			this.resolve();
			this.readystatechanged(this.state);
		},
		buildResponse: function() {
			for (var i = 0, x, length = this.includes.length; x = this.includes[i], i < length; i++) {
				switch (x.res.type) {
				case 'js':
				case 'load':
				case 'ajax':
					var obj = (this.response[x.res.type] || (this.response[x.res.type] = []));
					if (x.namespace != null) {
						obj = helper.ensureArray(obj, x.namespace);
					}

					obj[x.index] = x.res.obj;
					break;
				}


			};
			return this.response;
		}
	});

	var LazyModule = {
		create: function(xpath, code) {
			var arr = xpath.split('.'),
				obj = window,
				module = arr[arr.length - 1];
			while (arr.length > 1) {
				var prop = arr.shift();
				obj = obj[prop] || (obj[prop] = {});
			}
			arr = null;
			obj.__defineGetter__(module, function() {

				delete obj[module];
				try {
					var r = __includeEval(code, window.include);
					if (r != null) obj[module] = r;
				} catch (error) {
					error.xpath = xpath;
					helper.reportError(e);
				} finally {
					code = null;
					xpath = null;

					return obj[module];
				}
			});
		}
	}



	////////	/*@ see IncludeInstance */
	////////	return new Include();
	////////});
	////////
	////////window.include = IncludeInstance();

	w.include = new Include();
	w.include.helper = helper;
	w.IncludeResource = Resource;


}(window, window.document);

window.__includeEval = function(source, include) {
	return eval(source);
}