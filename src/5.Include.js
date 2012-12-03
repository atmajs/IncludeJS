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
				//cfg[key] = arg[key];
				
				if (key == 'lockedToFolder'){
					cfg[key] = arg[key];
					continue;
				}
				
				console.log('reg', key, arg[key]);
				Routes.register(key, arg[key]);
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