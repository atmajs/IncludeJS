(function() {

	cfg.server = true;

	var fs = require('fs'),
		vm = require('vm'),
		Module = global.module.constructor,
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

			var that = this;
			
			file_read(this.url, function(err, data) {
				if (err) {
					console.error('>>', err.code, err.path);
					data = '';
				}
				that.readyState = 4;
				that.responseText = data;
				that.onreadystatechange();
				
				if (err == null && cfg.autoreload) {
					file_watch(that.url, bin_removeDelegate(that.url));
				}
			});
		
		}
	};
	
	function file_read(url, callback) {
		if (cfg.sync) {
			try {
				var content = fs.readFileSync(url, 'utf8');
				
				callback(null, content);
			} catch(error) {
				console.error('File Read - ', error);
			}
			
			return;
		}
		fs.readFile(url, 'utf8', callback);
	}
	
	var file_watch = (function(){
		var _watchers = {};
		
		function _unbind(path) {
			if (_watchers[path] == null)
				return;
			
			_watchers[path].close();
			_watchers[path] = null;
		}
		
		return function(path, callback){
			_unbind(path);
			_watchers[path] = fs.watch(path, callback);
		};
	}());
	
	
	function bin_removeDelegate(url) {
		// use timeout as sys-file-change event is called twice
		var timeout;
		return function(){
			if (timeout) 
				clearTimeout(timeout);
			
			timeout = setTimeout(function(){
				bin_remove(url);
			}, 150);
		};
	}
	function bin_remove(mix) {
		if (mix == null) 
			return;
		
		var type,
			id,
			index,
			res;
			
		var isUrl = typeof mix === 'string',
			url = isUrl ? mix : null;
		
		
		for (type in bin) {
			
			for (id in bin[type]) {
				
				if (isUrl === false) {
					if (bin[type][id] === mix) {
						delete bin[type][id];
						return;
					}
					continue;
				}
				
				index = id.indexOf(url);
				if (index !== -1 && index === id.length - url.length) {
					
					res = bin[type][id];
			
					delete bin[type][id];
					
					if (type === 'load') {
						bin_remove(res.parent);
					}
					
					return;
				}
			}
			
		}
		console.warn('[bin_remove] Resource is not in cache', url);
	}

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
		
		url = url
			.replace('file://', '')
			.replace(/\\/g, '/')
			.replace(/\?[^\n]+$/, '');
		
		if (/^\/\w+:\/[^\/]/i.test(url)){
			// win32 drive
			return url.substring(1);
		}
		
		return url;
	}

	function getDir(url) {
		return url.substring(0, url.lastIndexOf('/'));
	}
	
	obj_inherit(Resource, {
		
		path_getFile: function(){
			return getFile(this.url);
		},
		
		path_getDir: function(){
			return getDir(getFile(this.url));
		},
	
		inject: function() {
			
			var pckg = arguments.length === 1
				? arguments[0]
				: __array_slice.call(arguments);
			
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
		},
	
		instance: function(currentUrl) {
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
		}
	});



}());