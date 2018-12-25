import { Events } from './Events'
import { IncludeNested } from './IncludeNested'
import { Routes } from './Routing'
import { cfg } from './Config'
import { emptyResponse } from './global';
import { tree_resolveUsage } from './utils/tree';
import { State } from './models/State'
import { ResourceType } from './models/Type'

declare var global: any;


export class IncludeDeferred {
	callbacks: {state: State, callback: Function }[] = []
	
	state: State = State.Unknown
	response: any = null
	includes: IncludeNested[] = []

	type: ResourceType

	// Array: exports
	_use: any[] = null

	// Array: names
	_usage: string[] = null
	
	on (state: State, callback: Function, sender: any = null, mutator?: 'unshift' | 'push'): this {
		if (this === sender && this.state === State.Unknown) {
			callback(this);
			return this;
		}

		// this === sender in case when script loads additional
		// resources and there are already parents listeners

		if (mutator == null) {
			mutator = (this.state < State.Evaluated || this === sender)
				? 'unshift'
				: 'push'
				;
		}

		state <= this.state ? callback(this) : this.callbacks[mutator]({
			state: state,
			callback: callback
		});
		return this;
	}
	
	hasPendingChildren () {
		return false;
	}

	readystatechanged (state) {

		if (this.state < state) {
			this.state = state;
		}

		if (this.state === State.Evaluated) {
			if (this.hasPendingChildren()) {
				return;
			}
			this.state = State.AllCompleted;
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
	}

	/** assets loaded and DomContentLoaded */

	ready (callback: Function) {
		return this.on(State.AllCompleted, () => {
			Events.ready(() => this.resolve(callback));
		}, this);
	}

	/** assets loaded */
	done (callback: Function) {
		return this.on(State.AllCompleted, () => this.resolve(callback), this);
	}
	resolve (callback: Function) {
		var includes = this.includes,
			length = includes == null
				? 0
				: includes.length
				;

		if (length > 0){
			
			for(var i = 0; i < length; i++){
				var x = includes[i];
				var resource = x.resource;
                var route = x.route;
                var type = resource.type;

				if (resource.exports == null) {
                    continue;
                }
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
		
		if (this._use == null && this._usage != null){
			this._use = tree_resolveUsage(this, this._usage, () => {
				this.state = State.AllCompleted;
				this.resolve(callback);
				this.readystatechanged(State.AllCompleted);
			});
			if (this.state < State.AllCompleted)
				return;
		}
		if (this._use) {
			callback.apply(null, [response].concat(this._use));
			return;
		}

		var before = null;
		if (this.type === ResourceType.Js) {
			before = global.include
			global.include = this;
		}
		callback(response);
		if (before != null && global.include === this) {
			global.include = before;	
		}
	}
};
