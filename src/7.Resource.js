var Resource = Class({
	Base: Include,
	Extends: IncludeDeferred,
	Construct: function(type, route, namespace, xpath, parent, id) {

		if (type == null) {
			return this;
		}

		var url = route && route.path;


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
			} else if (url[0] == '/') {
				id = url;
			} else if (parent && parent.namespace) {
				id = parent.namespace + '/' + url;
			} else if (parent && parent.location) {
				id = '/' + parent.location.replace(/^[\/]+/, '') + url;
			} else if (parent && parent.id) {
				id = parent.id + '/' + url;
			} else {
				id = '/' + url;
			}
		}

		if (bin[type] && bin[type][id]) {
			return bin[type][id];
		}


		if (rewrites != null && rewrites[id] != null) {
			url = rewrites[id];
		} else {
			url = this.url;
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
	},
	include: function(type, pckg) {
		this.state = 0;
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


		if (resource != null && resource.obj != null && resource.obj instanceof Include === false) {

			switch (resource.type) {
			case 'js':
			case 'load':
			case 'ajax':

				//////if (this.response == null) {
				//////	this.response = {};
				//////}

				var obj = (this.response[resource.type] || (this.response[resource.type] = []));

				if (resource.namespace != null) {
					obj = Helper.ensureArray(obj, resource.namespace);
				}
				obj[resource.index] = resource.obj;
				break;
			}
		}

		var includes = this.includes;
		if (includes && includes.length) {
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
				this.obj = response;
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