var IncludeDeferred = function() {
	this.callbacks = [];
	this.state = 0;
};

IncludeDeferred.prototype = { /**	state observer */

	on: function(state, callback) {
		state <= this.state ? callback(this) : this.callbacks.unshift({
			state: state,
			callback: callback
		});
		return this;
	},
	readystatechanged: function(state) {

		var i, length, x, currentInclude;

		if (state > this.state) {
			this.state = state;

			if (this.state === 3) {
				var includes = this.includes;

				if (includes != null && includes.length) {
					for (i = 0; i < includes.length; i++) {
						if (includes[i].state != 4) {
							return;
						}
					}
				}

				this.state = 4;
			}
		}

		i = 0;
		length = this.callbacks.length;
		
		if (length === 0){
			return;
		}
		
		//do not set asset resource to global
		if (this.type === 'js' && this.state === 4) {
			currentInclude = global.include;
			global.include = this;
		}

		for (; i < length; i++) {
			x = this.callbacks[i];
			if (x.state > this.state) {
				continue;
			}
			
			this.callbacks.splice(i,1);
			length--;
			i--;
			
			x.callback(this);
			
			if (this.state < 4){
				break;
			}
		}
		
		if (currentInclude != null){
			global.include = currentInclude;
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
		if (this.includes.length > 0 && this.response == null){
			this.response = {};
			
			for(var i = 0, x, length = this.includes.length; i<length; i++){
				x = this.includes[i];
				if (!x.exports){
					continue;
				}
				
				var type = x.type;
				switch (type) {
				case 'js':
				case 'load':
				case 'ajax':

					var alias = x.route.alias || Routes.parseAlias(x),
						obj = type == 'js' ? this.response : (this.response[type] || (this.response[type] = {}));
					
					if (alias) {
						obj[alias] = x.exports;						
						break;
					} else {
						console.warn('Resource Alias is Not defined', x);
					}
					break;
				}
				
			}	
		}
		callback(this.response);
	}
};