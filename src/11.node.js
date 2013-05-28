(function() {

	var fs = require('fs'),
		vm = require('vm'),
		Module = module.constructor,
		globalPath,
		includePath;


	XMLHttpRequest = function() {};
	XMLHttpRequest.prototype = {
		constructor: XMLHttpRequest,
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

	__eval = function(source, include, isGlobalCntx) {

		global.include = include;
		global.require = require;
		global.exports = module.exports;
		global.__filename = getFile(include.url);
		global.__dirname = getDir(global.__filename);
		global.module = module;

		if (isGlobalCntx !== true) {
			source = '(function(){ ' + source + ' }())';
		}

		try {
			vm.runInThisContext(source, global.__filename);
		} catch(e) {
			console.error('Module Evaluation Error', include.url);
			console.error(e.stack);
		}
		

		if (include.exports == null) {
			include.exports = module.exports;
		}

	};


	function getFile(url) {
		return url.replace('file:///', '')
			.replace(/\\/g, '/');
	}

	function getDir(url) {
		return url.substring(0, url.lastIndexOf('/'));
	}


	Resource.prototype.inject = function(pckg) {
		var current = include;
		
		include.state = include.state >= 3 ? 3 : 2;
		include
			.create()
			.load(pckg)
			.done(function(resp){


			var sources = resp.load,
				key;
			try {
				for (key in sources) {
					__eval(sources[key], include , true);
				}
			} catch (e) {
				console.error('Injected Script Error\n', e);
			}

			include.readystatechanged(3);
		});

		return current;
	};


	Resource.prototype.instance = function(currentUrl) {
		if (typeof currentUrl === 'string') {

			var old = module,
				next = new Module(currentUrl, old);

			next.filename = getFile(currentUrl);
			next.paths = Module._nodeModulePaths(getDir(next.filename));


			if (!globalPath) {
				var delimiter = process.platform === 'win32' ? ';' : ':',
					parts = process.env.path.split(delimiter),
					globalPath = ruqq.arr.first(parts, function(x){
						return /([\\\/]npm[\\\/])|([\\\/]npm$)/gi.test(x);
					});

				if (globalPath){
					globalPath = globalPath.replace(/\\/g, '/');
					globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';
	
					includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
				}else {
					console.error('Could not resolve global NPM Directory from system path');
					console.log('searched with pattern /npm');
				}
			}


			next.paths.unshift(includePath);
			next.paths.unshift(globalPath);

			module = next;
			require = next.require.bind(next);
		}

		var res = new Resource();
		res.state = 4;
		return res;
	};



}());