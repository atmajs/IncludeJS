(function(global) {


	global.include.js({
		lib: ['mask', 'mask/plugin.reload::reloadPlugin' ]
	}).embed('/socket.io/socket.io.js').done(function(resp) {

		if (!global.io) {
			return;
		}

		var socket = global.io.connect();

		socket.on('filechange', function(path) {
			console.log('Changed:', path);

			fileChanged(path);
		});
	});


	function fileChanged(path) {
		var ext = /\w+$/g.exec(path)[0],
			resource = include.getResource(path);

		if (resource && resource.reload) {
			XHR(path, function(path, response) {

				global.include = resource;
				resource.reload(response);
			});
			return;
		}

		if (resource){
			if (resource.reload){
				XHR(path, function(path, response) {
					global.include = resource;
					resource.reload(response);
				});
				return;
			}

			if (resource.type == 'load' && resource.parent && resource.parent.reload){
				XHR(resource, function(resource, response) {
					resource.exports = response;
					resource.parent.includes = [];
					fileChanged(resource.parent.url);
				});
				return;
			}

		}


		var handler = Handlers[ext];

		if (handler) {
			handler(path);
		} else {
			global.location.reload();
		}
	}


	var Handlers = {
		css: function(path) {

			var styles = document.getElementsByTagName('link'),
				length = styles.length,
				i = 0,
				x, href;

			for (; i < length; i++) {
				x = styles[i];
				href = x.getAttribute('href');

				if (!href) {
					continue;
				}

				if (~href.indexOf('?')) {
					href = href.substring(0, href.indexOf('?'));
				}

				if (~path.toLowerCase().indexOf(href.toLowerCase())) {

					reloadTag(x, 'href');

					break;
				}
			}
		}
	}

	function reloadTag(node, srcAttribute) {
		var clone = node.cloneNode(),
			src = node.getAttribute(srcAttribute);

		src += (src.indexOf('?') > -1 ? '&' : '?') + Date.now() + '=true';

		clone.setAttribute(srcAttribute, src);

		node.parentNode.replaceChild(clone, node);
	}

}(typeof window === 'undefined' ? global : window));
