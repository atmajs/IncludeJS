
/**
 * STATES:
 * 0: Resource Created
 * 1: Loading
 * 2: Loaded - Evaluating
 * 2.5: Paused - Evaluating paused
 * 3: Evaluated - Childs Loading
 * 4: Childs Loaded - Completed
 */

var IncludeDeferred = function() {
	this.callbacks = [];
	this.state = -1;
};

IncludeDeferred.prototype = { /**	state observer */

	on: function(state, callback, sender, mutator) {
		if (this === sender && this.state === -1) {
			callback(this);
			return this;
		}

		// this === sender in case when script loads additional
		// resources and there are already parents listeners

		if (mutator == null) {
			mutator = (this.state < 3 || this === sender)
				? 'unshift'
				: 'push'
				;
		}

		state <= this.state ? callback(this) : this.callbacks[mutator]({
			state: state,
			callback: callback
		});
		return this;
	},
	hasPendingChildren: function() {
		var arr = this.includes;
		if (arr == null) {
			return false;
		}
		var imax = arr.length,
			i = -1;
		while (++i < imax) {
			if (arr[i].resource.state !== 4) {
				return true;
			}
		}
		return false;
	},
	readystatechanged: function(state) {

		if (this.state < state) {
			this.state = state;
		}

		if (this.state === 3) {
			if (this.hasPendingChildren()) {
				return;
			}
			this.state = 4;
		}
		
		var currentState = this.state,
			cbs = this.callbacks,
			imax = cbs.length,
			i = -1;
		
		if (imax === 0){
			return;
		}
		
		while(++i < imax) {
			var x = cbs[i];
			if (x == null || x.state > this.state) {
				continue;
			}

			cbs.splice(i, 1);
			imax--;
			i--;
			x.callback(this);

			if (this.state < currentState) {
				break;
			}
		}
	},

	/** assets loaded and DomContentLoaded */

	ready: function(callback) {
		var that = this;
		return this.on(4, function() {
			Events.ready(function(){
				that.resolve(callback);
			});
		}, this);
	},

	/** assets loaded */
	done: function(callback) {
		var that = this;
		return this.on(4, function(){
			that.resolve(callback);
		}, this);
	},
	resolve: function(callback) {
		var includes = this.includes,
			length = includes == null
				? 0
				: includes.length
				;

		if (length > 0 && this.response == null){
			this.response = {};

			var resource,
				route;

			for(var i = 0, x; i < length; i++){
				x = includes[i];
				resource = x.resource;
				route = x.route;

				if (typeof resource.exports === 'undefined')
					continue;

				var type = resource.type;
				switch (type) {
				case 'js':
				case 'load':
				case 'ajax':
				case 'mask':
					var alias = route.alias || Routes.parseAlias(route),
						obj = type === 'js'
							? (this.response)
							: (this.response[type] || (this.response[type] = {}))
							;

					if (alias != null) {
						var exp = resource.exports;
						if (cfg.es6Exports && (exp != null && typeof exp === 'object')) {
							exp = exp.default || exp;
						}						
						obj[ alias ] = exp;
						break;
					}
					console.warn('<includejs> Alias is undefined', resource);
					break;
				}
			}
		}

		var response = this.response || emptyResponse;
		var that = this;
		if (this._use == null && this._usage != null){
			this._use = tree_resolveUsage(this, this._usage, function(){
				that.state = 4;
				that.resolve(callback);
				that.readystatechanged(4);
			});
			if (this.state < 4)
				return;
		}
		if (this._use) {
			callback.apply(null, [response].concat(this._use));
			return;
		}

		var before = null;
		if (this.type === 'js') {
			before = global.include
			global.include = this;
		}
		callback(response);
		if (before != null && global.include === this) {
			global.include = before;	
		}
	}
};
