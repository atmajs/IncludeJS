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