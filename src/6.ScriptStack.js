/** @TODO Refactor loadBy* {combine logic} */

var ScriptStack = (function() {

	var head, currentResource, stack = [],
		loadScript = function(url, callback) {
			//console.log('load script', url);
			var tag = document.createElement('script');
			tag.type = 'text/javascript';
			tag.src = url;

			if ('onreadystatechange' in tag) {
				tag.onreadystatechange = function() {
					(this.readyState === 'complete' || this.readyState === 'loaded') && callback();
				};
			} else {
				tag.onload = tag.onerror = callback;
			}(head || (head = document.getElementsByTagName('head')[0])).appendChild(tag);
		},

		loadByEmbedding = function() {
			if (stack.length === 0) {
				return;
			}

			if (currentResource != null) {
				return;
			}

			var resource = (currentResource = stack[0]);

			if (resource.state === 1) {
				return;
			}

			resource.state = 1;

			global.include = resource;
			global.iparams = resource.route.params;


			function resourceLoaded(e) {


				if (e && e.type === 'error') {
					console.log('Script Loaded Error', resource.url);
				}

				var i = 0,
					length = stack.length;

				for (; i < length; i++) {
					if (stack[i] === resource) {
						stack.splice(i, 1);
						break;
					}
				}

				if (i === length) {
					console.error('Loaded Resource not found in stack', resource);
					return;
				}

				resource.readystatechanged(3);

				currentResource = null;
				loadByEmbedding();
			}

			if (resource.source) {
				__eval(resource.source, resource);

				resourceLoaded();
				return;
			}

			loadScript(resource.url, resourceLoaded);
		},
		processByEval = function() {
			if (stack.length === 0) {
				return;
			}
			if (currentResource != null) {
				return;
			}

			var resource = stack[0];

			if (resource.state < 2) {
				return;
			}

			currentResource = resource;

			resource.state = 1;
			global.include = resource;

			//console.log('evaling', resource.url, stack.length);
			__eval(resource.source, resource);

			for (var i = 0, x, length = stack.length; i < length; i++) {
				x = stack[i];
				if (x === resource) {
					stack.splice(i, 1);
					break;
				}
			}

			resource.readystatechanged(3);
			currentResource = null;
			processByEval();

		};


	return {
		load: function(resource, parent, forceEmbed) {

			//console.log('LOAD', resource.url, 'parent:',parent ? parent.url : '');

			var added = false;
			if (parent) {
				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === parent) {
						stack.splice(i, 0, resource);
						added = true;
						break;
					}
				}
			}

			if (!added) {
				stack.push(resource);
			}

			// was already loaded, with custom loader for example

			if (!cfg.eval || forceEmbed) {
				loadByEmbedding();
				return;
			}

			if (cfg.sync === true) {
				currentResource = null;
			}


			if (resource.source) {
				resource.state = 2;
				processByEval();
				return;
			}

			XHR(resource, function(resource, response) {
				if (!response) {
					console.error('Not Loaded:', resource.url);
				}

				resource.source = response;
				resource.state = 2;

				processByEval();
			});
		},
		/* Move resource in stack close to parent */
		moveToParent: function(resource, parent) {
			var length = stack.length,
				parentIndex = -1,
				resourceIndex = -1,
				i;

			for (i = 0; i < length; i++) {
				if (stack[i] === resource) {
					resourceIndex = i;
					break;
				}
			}

			if (resourceIndex === -1) {
				// this should be not the case, but anyway checked.
				console.warn('Resource is not in stack', resource);
				return;
			}

			for (i= 0; i < length; i++) {
				if (stack[i] === parent) {
					parentIndex = i;
					break;
				}
			}

			if (parentIndex === -1) {
				//// - should be already in stack
				////if (parent == null) {
				////	stack.unshift(resource);
				////}
				return;
			}

			if (resourceIndex < parentIndex) {
				return;
			}

			stack.splice(resourceIndex, 1);
			stack.splice(parentIndex, 0, resource);


		}
	};
})();
