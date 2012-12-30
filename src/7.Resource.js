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
		
		if (CustomLoader.hanlder(resource) === true){
			return this;
		}

		var tag;
		switch (type) {
		case 'js':
		case 'embed':
			ScriptStack.load(this, parent, type == 'embed');
			
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
		}
		if (tag != null) {
			document.getElementsByTagName('head')[0].appendChild(tag);
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
		if (this.response == null){
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
				
				
				if (alias){
					obj[alias] = resource.exports;
					break;
				}else{
					console.warn('Resource Alias is Not defined', resource);
				}
				
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