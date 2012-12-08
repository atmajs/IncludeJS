var Routes = (function() {

	var routes = {};

	return {
		/**
		 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
		 */
		register: function(namespace, route) {

			routes[namespace] = route instanceof Array ? route : route.split(/[\{\}]/g);

		},

		/**
		 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
		 */
		resolve: function(namespace, template) {
			var questionMark = template.indexOf('?'),
				path, params, route, i, x, length;

			if (~questionMark) {
				var arr = template.substring(questionMark + 1).split('&');

				params = {};
				for (i = 0, length = arr.length; i < length; i++) {
					x = arr[i].split('=');
					params[x[0]] = x[1];
				}

				template = template.substring(0, questionMark);
			}

			template = template.split('/');
			route = routes[namespace];
			
			if (route == null){
				return {
					path: template,
					params: params
				};
			}
			
			path = route[0];
			
			for (i = 1; i < route.length; i++) {
				if (i % 2 === 0) {
					path += route[i];
				} else {
					/** if template provides less "breadcrumbs" than needed -
					 * take always the last one for failed peaces */
					
					var index = route[i] << 0;
					if (index > template.length - 1) {
						index = template.length - 1;
					}
					
					
					
					path += template[index];
					
					if (i == route.length - 2){
						for(index++;index < template.length; index++){
							path += '/' + template[index];
						}
					}
				}
			}

			return {
				path: path,
				params: params
			};
		},

		/**
		 *	@arg includeData :
		 *	1. string - URL to resource
		 *	2. array - URLs to resources
		 *	3. object - {route: x} - route defines the route template to resource,
		 *		it must be set before in include.cfg.
		 *		example:
		 *			include.cfg('net','scripts/net/{name}.js')
		 *			include.js({net: 'downloader'}) // -> will load scipts/net/downloader.js
		 *	@arg namespace - route in case of resource url template, or namespace in case of LazyModule
		 *
		 *	@arg fn - callback function, which receives namespace|route, url to resource and ?id in case of not relative url
		 *	@arg xpath - xpath string of a lazy object 'object.sub.and.othersub';
		 */
		each: function(type, includeData, fn, namespace, xpath) {
			var key;

			if (includeData == null) {
				console.error('Include Item has no Data', type, namespace);
				return;
			}

			if (type == 'lazy' && xpath == null) {
				for (key in includeData) {
					this.each(type, includeData[key], fn, null, key);
				}
				return;
			}
			if (includeData instanceof Array) {
				for (var i = 0; i < includeData.length; i++) {
					this.each(type, includeData[i], fn, namespace, xpath);
				}
				return;
			}
			if (typeof includeData === 'object') {
				for (key in includeData) {
					if (hasOwnProp.call(includeData, key)) {
						this.each(type, includeData[key], fn, key, xpath);
					}
				}
				return;
			}

			if (typeof includeData === 'string') {
				var x = includeData;
				if (namespace) {
					x = this.resolve(namespace, includeData);
					namespace += '.' + includeData;					
				}else{
					x = {
						path: x
					};
				}
				
				
				fn(namespace, x, xpath);
				return;
			}

			console.error('Include Package is invalid', arguments);
		},

		getRoutes: function(){
			return routes;
		}
	};
	
})();


/*{test}

Routes.register('lib', '.reference/libjs/{0}/lib/{1}.js');
console.log(JSON.stringify(Routes.resolve('lib','scroller/scroller.mobile?ui=black')));

Routes.register('framework', '.reference/libjs/framework/{0}.js');
console.log(JSON.stringify(Routes.resolve('framework','dom/jquery')));


*/