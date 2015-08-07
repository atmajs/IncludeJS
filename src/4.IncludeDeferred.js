
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
	readystatechanged: function(state) {

		var i, length, x, currentInclude;

		if (state > this.state) {
			this.state = state;
		}

		if (this.state === 3) {
			var includes = this.includes;

			if (includes != null && includes.length) {
				for (i = 0; i < includes.length; i++) {
					if (includes[i].resource.state !== 4) {
						return;
					}
				}
			}

			this.state = 4;
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
			if (x == null || x.state > this.state) {
				continue;
			}

			this.callbacks.splice(i,1);
			length--;
			i--;

			/* if (!DEBUG)
			try {
			*/
				x.callback(this);
			/* if (!DEBUG)
			} catch(error){
				console.error(error.toString(), 'file:', this.url);
			}
			*/

			if (this.state < 4){
				break;
			}
		}

		if (currentInclude != null && currentInclude.type === 'js'){
			global.include = currentInclude;
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
						obj[ alias ] = resource.exports;
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

		callback(response);
	}
};
