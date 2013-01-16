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
		
		r.type = 'js';
		
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
	},
	
	getResource: function(url){
		var id = (url[0] == '/' ? '' : '/' )+ url;
		
		for(var key in bin){
			if (bin[key].hasOwnProperty(id)){
				return bin[key][id];
			}
		}
		return null;
	},
	
	plugin: function(pckg, callback){
		
		var urls = [],
			length = 0,
			j = 0,
			i = 0,
			onload = function(url, response){
				j++;
				
				embedPlugin(response);
				
				if (j == length - 1 && callback){
					callback();
					callback = null;
				}
			};
		Routes.each('', pckg, function(namespace, route){
			urls.push(route.path[0] == '/' ? route.path.substring(1) : route.path);
		});
		
		length = urls.length;
		
		for(; i<length; i++){
			XHR(urls[i], onload);
		}
		return this;
	}
};

function embedPlugin(source){
	eval(source);
}