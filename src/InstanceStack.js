var InstanceStack;
(function(){
	InstanceStack = {
		add: function(resource) {
			_stack.push(resource);
			resource_freeze(resource);

			if (_stack.length === 1) {				
				continueOnReady(global.include, function(){
					resource_resume(resource);
				});
			}
			continueOnReady(resource, tick);
		}
	};

	function tick () {
		var len = _stack.length;
		if (len === 0) return;
		_stack.shift();
		if (len === 1)
			return;

		resource_resume(_stack[0]);
	}

	function continueOnReady (resource, fn) {
		setTimeout(function() {
			resource.on(4, function () {
				setTimeout(fn);
			});
		});
	}

	var _stack = [],
		_fns = ['js', 'css', 'load', 'ajax', 'embed', 'lazy', 'mask', 'inject'],
		_fns_count = _fns.length;

	function resource_freeze(include) {
		include.state = 1;
		include.bag = new Bag(include);

		var i = _fns_count, prop;
		while (--i !== -1){
			prop = _fns[i];
			include[prop] = include.bag[prop].bind(include.bag);
		}
	}

	function Bag (include) {
		this.arr = [];
		this.include = include;
	}

	(function(){
		var i = _fns_count,
			slice_ = Array.prototype.slice;
		while (--i > -1) {
			var name = _fns[i];
			Bag.prototype[name] = create_addToBackFn(_fns[i]);
		}

		function create_addToBackFn(name) {
			return function(){
				var args = slice_.call(arguments);
				this.arr.push([name, args]);
				return this.include;
			};	
		}
	}());

	
	function resource_resume(include) {
		var i = _fns_count;
		while (--i > -1) {
			var name = _fns[i];
			include[name] = Include.prototype[name];
		}
		
		include.state = 3;
		include.inject = include.js;
		if (include.bag) {
			var i = -1,
				arr = include.bag.arr,
				imax = arr.length;
			while ( ++i < imax ) {
				var entry = arr[i];
				include[entry[0]].apply(include, [entry[1]]);
			}
		}
	}
}());