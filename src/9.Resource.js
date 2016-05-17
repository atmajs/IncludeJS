var Resource;

(function(Include, Routes, ScriptStack, CustomLoader) {

	Resource = function(type, route, namespace, xpath, parent, id, priority) {
		Include.call(this);

		var url = route && route.path;
		if (url != null) {
			url = PathResolver.resolveBasic(url, type, parent);
		}
		if (id == null && url) {
			id = (path_isRelative(url) ? '/' : '') + url;
		}
		var resource = bin[type] && bin[type][id];
		if (resource) {
			if (resource.state < 4 && type === 'js') {
				ScriptStack.moveToParent(resource, parent);
			}
			return resource;
		}

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

		(bin[type] || (bin[type] = {}))[id] = this;
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
			this.exports = {};
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
					document.getElementsByTagName('head')[0].appendChild(tag);
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