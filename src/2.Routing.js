var Routing = (function(){
	
	var routes = {};
	
	return {
		/**
		 *	@param route {String} = Example: '.reference/libjs/{0}/{1}.js'
		 */
		register: function(namespace, route){
			
			routes[namespace] = route.split(/[\{\}]/g);
			
		},
		
		/**
		 *	@param {String} template = Example: 'scroller/scroller.min?ui=black'
		 */
		resolve: function(namespace, template){
			var questionMark = template.indexOf('?'),
				path,
				args,
				route;
				
			if (~questionMark){
				var arr = template.substring(questionMark + 1).split('&');
				
				args = {};
				for(var i = 0, x, length = arr.length; i<length; i++){
					x = arr[i].split('=');
					args[x[0]] = x[1];
				}
				
				template = template.substring(0, questionMark);
			}
			
			template = template.split('/');			
			route = routes[namespace];
			path = route[0];
			
			for(var i = 1; i< route.length; i++){
				if (i%2 == 0){
					path += route[i];
				}else{
					/* if template provides less "breadcrumbs" than needed -
					 * take always the last one for failed peaces */
					path += template.length > 1 ? template.shift() : template[0];
				}
			}
			
			return {
				path: path,
				args: args
			};
		}
	}
	
})();


/*{inline test}
Routing.register('lib', '.reference/libjs/{0}/{1}.js');
console.log(JSON.stringify(Routing.resolve('lib','scroller?ui=black')));
*/



