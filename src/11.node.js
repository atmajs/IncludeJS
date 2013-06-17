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

			if (this.url.indexOf('file://') !== -1) {
				this.url = getFile(this.url);
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
		module.exports = {};
		
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
			var exports = module.exports;
			
			if (typeof exports !== 'object' || Object.keys(exports).length) {
				include.exports = module.exports;
			}
		}

	};


	function getFile(url) {
		url = url.replace('file://', '').replace(/\\/g, '/');
		
		if (/^\/\w+:\/[^\/]/i.test(url)){
			// win32 drive
			return url.substring(1);
		}
		
		return url;
	}

	function getDir(url) {
		return url.substring(0, url.lastIndexOf('/'));
	}


	Resource.prototype.inject = function(pckg) {
			var current = this;
			
			current.state = current.state >= 3 ? 3 : 2;
			
			var bundle = current.create();
			
			bundle.url = this.url;
			bundle.location = this.location;
			bundle.load(pckg).done(function(resp){
	
				var sources = resp.load,
					key,
					resource;
				
				try {
					for(var i = 0; i< bundle.includes.length; i++){
						//@TODO - refactor
						
						var resource = bundle.includes[i].resource,
							source = resource.exports;

						
						resource.exports = null;
						resource.type = 'js';
						resource.includes = null;
						resource.state = 3;
						
						
						for (var key in bin.load) {
							if (bin.load[key] === resource) {
								delete bin.load[key];
								break;
							}
						}
						

						__eval(source, resource, true);

						
						resource.readystatechanged(3);

					}
				} catch (e) {
					console.error('Injected Script Error\n', e, key);
				}
	
				
				bundle.on(4, function(){
					
					current
						.includes
						.splice
						.apply(current.includes, [bundle, 1].concat(bundle.includes));

					current.readystatechanged(3);
				});
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
					PATH = process.env.PATH || process.env.path;

				if (!PATH){
					console.error('PATH not defined in env', process.env);
				}

				var parts = PATH.split(delimiter),
					globalPath = ruqq.arr.first(parts, function(x){
						return /([\\\/]npm[\\\/])|([\\\/]npm$)/gi.test(x);
					});

				if (globalPath){
					globalPath = globalPath.replace(/\\/g, '/');
					globalPath += (globalPath[globalPath.length - 1] !== '/' ? '/' : '') + 'node_modules';
	
					includePath = io.env.applicationDir.toLocalDir() + 'node_modules';
				}else {
					console.error('Could not resolve global NPM Directory from system path');
					console.log('searched with pattern /npm in', PATH, delimiter);
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