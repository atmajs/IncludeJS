(function() {

	
	window.include.embed('/socket.io/socket.io.js').done(function() {
		
		if (!window.io){
			return;
		}
		
		var socket = window.io.connect();

		socket.on('filechange', function(path) {
			console.log(path);

			fileChanged(path);
		});
	});


	function fileChanged(path) {
		var ext = /\w+$/g.exec(path)[0],
			resource = include.getResource(path);
			
		if (resource && resource.reload){
			XHR(path, function(path, response){
				
				window.include = resource;
				resource.reload(response);
			});
			return;
		}
		
		
		var handler = handlers[ext];
		
		if (handler){
			handler(path);
		}else{
			window.location.reload();
		}		
	}
	
	
	var handlers = {
		css: function(path){
			
			var styles = document.getElementsByTagName('link'),
				length = styles.length,
				i = 0,
				x, href;
			
			for(; i < length; i++){
				x = styles[i];				
				href = x.getAttribute('href');
				
				if (!href){
					continue;
				}
			
				if (~href.indexOf('?')) {
					href = href.substring(0, href.indexOf('?'));
				}	
				
				if (~path.toLowerCase().indexOf(href.toLowerCase())){
					
					reloadTag(x, 'href');
					
					break;
				}				
			}		
		}
	}
	
	function reloadTag(node, srcAttribute){
		var clone = node.cloneNode(),
			src = node.getAttribute(srcAttribute);
		
		src += (src.indexOf('?') > -1 ? '&' : '?') + Date.now() + '=true';
		
		clone.setAttribute(srcAttribute, src);
		
		node.parentNode.replaceChild(clone, node);		
	}

}());