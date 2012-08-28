;
void

function(w, d) {
	//////- var IncludeInstance = (function() {
	var cfg = {
		path: ''
	},
		bin = {
			//load: {},
			//js: {},
			//css: {}
		},
		handler = {},
		helper = { /** TODO: improve url handling*/
			uri: {
				getDir: function(url) {
					var index = url.lastIndexOf('/');
					return index == -1 ? '' : url.substring(index + 1, -index);
				},
				/** @obsolete */
				resolveCurrent: function(collection) {
					if (collection.location != null) return collection.location;
					var scripts = document.querySelectorAll('script');
					return scripts[scripts.length - 1].getAttribute('src');
				},
				resolveUrl: function(url, parentPath) {
					
					if (url[0] == '/') return url.substring(1);
					switch (url.substring(0, 4)) {
					case 'file':
					case 'http':
						return url;
					}

					if (parentPath != null) return parentPath + url;
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
						//-fn(key, x[key], null, xpath);
					}

				} else if (this.isArray(x)) {
					for (var i = 0; i < x.length; i++) this.eachIncludeItem(type, x[i], fn, namespace);

				} else if (typeof x == 'string') {
					var route = namespace && include.cfg(namespace);
					if (route) {
						namespace += '.' + x;
						x = route.replace(new RegExp('\\{name\\}', 'g'), x);
					}
					fn(namespace, x, xpath);

				} else if (typeof x == 'object') {
					for (var key in x) this.eachIncludeItem(type, x[key], fn, key);

				} else {
					console.error('Include Item Data is invalid', x);
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
			var readycollection = [],
				loadcollection = [],
				timer = Date.now();

			d.onreadystatechange = function() {
				if (/complete|interactive/g.test(d.readyState) == false) return;

				if (timer) console.log('DOMContentLoader', d.readyState, Date.now() - timer, 'ms');
				events.domReady = true;
				events.ready = helper.doNothing;

				try{
					helper.invokeEach(readycollection);
				}catch(error){
					console.error('IncludeJS.events.onready', error);
				}
				finally{
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
		from: function(path) {
			if (this instanceof ResCollection) {
				this.path = path;
				return this;
			}
			if (this instanceof Resource) {
				return this;
			}
			if (this instanceof Include) {
				var collection = new ResCollection();
				collection.path = path;
				return collection;
			}
			console.error('Include of Undefined Type', this);
			return null;
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
					var namespaceID = _bin[key][i].namespace,
						urlID = _bin[key][i].url,
						id = namespaceID || urlID;

					var resource = new Resource();
					resource.state = 4;
					
					if (urlID) resource.location = helper.uri.getDir(urlID).substring(0);
					
					switch (key) {
					case 'load':
					case 'lazy':
						resource.state = 0;
						void
						function(_r, _id) {
							events.ready(function() {
								var container = document.querySelector('script[data-appuri="' + _id + '"]');
								if (container == null) {
									console.error('"%s" Data was not embedded into html', _id);
									return;
								}
								_r.obj = container.innerHTML;
								_r.readystatechanged(4);
							});
						}(resource, id);
						break;
					};
					(bin[key] || (bin[key] = {}))[id] = resource;
				}
			}
		}
	});


	var Resource = Class({
		Base: Include,
		Extends: StateObservable,
		Construct: function(type, url, namespace, xpath) {
			this.url = url;
			this.namespace = namespace;
			this.type = type;
			this.xpath = xpath;

			
			if (type == null) return this;

			var id = namespace || ('/' + url);

			console.log('ID', id);

			if (bin[type] && bin[type][id]) {
				console.log('Resource From Cache. ID', id);
				return bin[type][id];
			}

			(bin[type] || (bin[type] = {}))[id] = this;


			var tag;
			switch (type) {
			case 'js':
				helper.xhr(url, this.onload.bind(this));

				tag = d.createElement('script');
				tag.type = "application/x-included-placeholder";
				tag.src = url;
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
				this.obj = eval(response);
			} catch (error) {
				error.url = this.url;
				helper.reportError(error);
			} finally {
				include = null;
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
				this.location = parent.location;
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
				var array = helper.ensureArray((this.response[type] || (this.response[type] = [])), namespace);
				return array.length;
			}
			return -1;
		},
		process: function(type, data) {
			this.state = 0;
			this._isresolved = false;

			helper.eachIncludeItem(type, data, function(namespace, url, xpath) {

				url = helper.uri.resolveUrl(url, this.location);

				var resource = new Resource(type, url, namespace, xpath),
					info = {
						res: resource,
						index: this.index(type, namespace),
						namespace: namespace
					}
					this.includes.push(info);

				resource.on(4, this.resourceLoaded.bind(this));
			}.bind(this));

			return this;
		},
		resourceLoaded: function(resource) {
			for (var i = 0; i < this.includes.length; i++) if (this.includes[i].res.state != 4) return;
			this.state = 4;
			this.resolve();
			this.readystatechanged(4);
		},
		buildResponse: function() {
			helper.each(this.includes, function(x) {
				switch (x.res.type) {
				case 'js':
				case 'load':
				case 'ajax':
					var obj = helper.ensureArray(this.response, x.res.type);
					obj = helper.ensureArray(obj, x.namespace);
					obj[x.index] = x.res.obj;
					return;
				}
			}.bind(this));
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
					obj[module] = eval(code);
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


}(window, document)