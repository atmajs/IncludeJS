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
			var that = this;
			this.state = this.state >= 3 ? 3 : 2;

			if (this.includes == null) {
				this.includes = [];
			}
			if (this.childLoaded == null){
				this.childLoaded = function(child){
					childLoaded.call(that, that, child);
				};
			}

			this.response = null;

			Routes.each(type, pckg, function(namespace, route, xpath) {

				var resource = new Resource(type, route, namespace, xpath, that);

				that.includes.push({
					resource: resource,
					route: route
				});
				resource.on(4, that.childLoaded);
			});

			return this;
		}
	});

	return Resource;

}(Include, IncludeDeferred, Routes, ScriptStack, CustomLoader));
