(function() {

	var fs = require('fs'),
		vm = require('vm'),
		Module = module.constructor,
		globalPath,
		includePath;


	XMLHttpRequest = function() {};
	XMLHttpRequest.prototype = {
		open: function(method, url) {
			this.url = url;
		},
		send: function() {

			if (this.url.indexOf('file:///') > -1) {
				this.url = this.url.replace('file:///', '');
			}

			if (cfg.sync === true) {
				try {
					this.readyState = 4;
					this.responseText = fs.readFileSync(this.url, 'utf8');
					this.onreadystatechange();
				} catch (err) {
					console.error('>>', err.path, err.toString());
				}
			} else {
				var that = this;
				fs.readFile(this.url, 'utf8', function(err, data) {
					if (err) {
						console.error('>>', err.code, err.path);
						data = '';
					}
					that.readyState = 4;
					that.responseText = data;
					that.onreadystatechange();
				});
			}
		}
	};

	__eval = function(source, include) {

		global.include = include;
		global.require = require;
		global.exports = module.exports;
		global.__filename = getFile(include.url);
		global.__dirname = getDir(global.__filename);
		global.module = module;

		source = '(function(){ ' + source + ' }())';

		vm.runInThisContext(source, global.__filename);

		if (include.exports == null){
			include.exports = module.exports;
		}

	};


	function getFile(url) {
		return url.replace('file:///', '').replace(/\\/g, '/');
	}

	function getDir(url) {
		return url.substring(0, url.lastIndexOf('/'));
	}

	Resource.prototype.instance = function(currentUrl) {
		if (typeof currentUrl === 'string') {

			var old = module,
				next = new Module(currentUrl, old);

			next.filename = getFile(currentUrl);
			next.paths = Module._nodeModulePaths(getDir(next.filename));


			if (!globalPath) {
				var _path = /[^;]+[\\\/]npm[\\\/][^;]*/g.exec(process.env.path);

				globalPath = _path && _path[0].replace(/\\/g, '/');
				globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';

				includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
			}


			next.paths.unshift(includePath);
			next.paths.unshift(globalPath);

			module = next;
			require = next.require.bind(next);
		}

		return new Resource();
	}

}());
