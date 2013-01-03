var IncludeDeferred = function() {
	this.callbacks = [];
	this.state = 0;
};

IncludeDeferred.prototype = {
	/**	state observer */

	on: function(state, callback) {
		state <= this.state ? callback(this) : this.callbacks.unshift({
			state: state,
			callback: callback
		});
		return this;
	},
	readystatechanged: function(state) {
		var i, x, length;
		
		if (state > this.state){
			this.state = state;
			
			if (this.state === 3){
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
			
			//do not set asset resource to global
			if (this.type === 'js' && this.state === 4){
				global.include = this;
			}
			
		}
		
		for (i = 0, length = this.callbacks.length; i < length; i++) {
			x = this.callbacks[i];
			
			if (x.state > this.state || x.callback == null) {
				continue;
			}
			x.callback(this);
			x.callback = null;
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
		callback(this.response);		
	}
};