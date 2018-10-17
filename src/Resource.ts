import { Include } from './Include'
import { Bin } from './Bin'
import { path_normalize, path_resolveCurrent, path_getDir } from './utils/path';
import { PathResolver } from './PathResolver';
import { ScriptStack } from './ScriptStack';
import { isNode, __require } from './global'
import { res_groupByType } from './utils/res'
import { Routes } from './Routing';
import { CustomLoader } from './CustomLoader';
import { Helper } from './Helper';
import { LazyModule } from './LazyModule'
import { ResourceType } from './models/Type'
import { global } from './global'


export class Resource extends Include {

	id: string
	url: string
	namespace: string
	xpath: string
	priority: number
	route: any

	exports: any
	response: any

	constructor(type = null, route = null, namespace = null, xpath = null, parent: Include = null, id = null, priority = null) {
		super();


		var url = route && route.path;
		if (url != null) {
			url = path_normalize(url);
			url = PathResolver.resolveBasic(url, type, parent);
		}
		if (id == null && url) {
			id = url;
        }
        
		let resource = Bin.get(type, id);
		if (resource) {
			if (resource.state < 4 && type === 'js') {
				ScriptStack.moveToParent(resource, parent);
			}
			return resource;
		}

		this.id = id;
		this.url = url;
		this.type = type;
		this.xpath = xpath;
		this.route = route;
		this.parent = parent;
		this.priority = priority;
		this.namespace = namespace;
		this.base = parent && parent.base;
		this.childLoaded = this.childLoaded.bind(this);

		if (type == null) {
			this.state = 3;
			return this;
		}
		if (url == null) {
			this.state = 3;
			this.url = path_resolveCurrent();
			this.location = path_getDir(this.url);
			return this;
		}

		this.state = 0;
		this.location = path_getDir(url);

        Bin.add(type, id, this);

        let isNpm = PathResolver.isNpm(this.url);
        if (isNpm && isNode) {
            this.exports = __require.nativeRequire(this.url);
			this.readystatechanged(4);
			return this;
        }        
		if (isNpm === false) {
			process(this);
			return this;
        }		
		PathResolver.resolveNpm(this.url, this.type, this.parent, (error, url) => {
			if (error) {
				this.readystatechanged(4);
				return;
			}
			this.url = url;
			process(this);
		});
		return this;
	}




	setBase(baseUrl: string): this {
		this.base = baseUrl;
		return this;
	}

	hasPendingChildren() {
		var arr = this.includes;
		if (arr == null) {
			return false;
		}
		var imax = arr.length,
			i = -1;
		while (++i < imax) {
			if (arr[i].isCyclic) {
				continue;
			}
			if (arr[i].resource.state !== 4) {
				return true;
			}
		}
		return false;
	}

	childLoaded(child) {
		var includes = this.includes;
		if (includes && includes.length) {
			if (this.state < 3) {
				// resource still loading/include is in process, but one of sub resources are already done
				return;
			}
			for (var i = 0; i < includes.length; i++) {
				var data = includes[i];
				if (data.isCyclic) {
					continue;
				}
				if (data.resource.state !== 4) {
					return;
				}
			}
		}
		this.readystatechanged(4);
	}
	create(type: ResourceType, route = null, namespace = null, xpath = null, id = null) {
		this.state = this.state >= 3
			? 3
			: 2;
		this.response = null;

		if (this.includes == null) {
			this.includes = [];
		}

		var resource = new Resource(type, route, namespace, xpath, this, id);
		var data = {
			resource: resource,
			route: route,
			isCyclic: resource.contains(this.url)
		};
		this.includes.push(data);
		return data;
	}
	include (type: ResourceType, pckg: PackageArgument) {
		var children = [],
			child;

		Routes.each(type, pckg, (namespace, route, xpath) => {
			if (this.route != null && this.route.path === route.path) {
				// loading itself
				return;
			}
			child = this.create(type, route, namespace, xpath);
			children.push(child);
		});


		var i = -1,
			imax = children.length;
		while (++i < imax) {
			var x = children[i];
			if (x.isCyclic) {
				this.childLoaded(x.resource);
				continue;
			}
			x.resource.on(4, this.childLoaded);
		}

		return this;
	}
	require(arr) {
		if (this.exports == null) {
			this.exports = {};
		}
		this.includes = [];

		var pckg = res_groupByType(arr);
		for (var key in pckg) {
			this.include(key as ResourceType, pckg[key]);
		}
		return this;
	}

	pause() {
		this.state = 2.5;

		var that = this;
		return function (exports) {

			if (arguments.length === 1)
				that.exports = exports;

			that.readystatechanged(3);
		};
	}
	contains(url, refCache = []) {

		refCache.push(this);
		var arr = this.includes;
		if (arr == null) {
			return false;
		}
		for (var i = 0; i < arr.length; i++) {
			if (refCache.indexOf(arr[i].resource) !== -1) {
				continue;
			}
			if (arr[i].resource.url === url) {
				return true;
			}
			if (arr[i].resource.contains(url, refCache)) {
				return true;
			}
		}
		return false;
	}
	getNestedOfType(type) {
		return resource_getChildren(this.includes, type);
	}

	
	js (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Js, PackageExtract(pckg))
	}
	inject (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Js, PackageExtract(pckg))
	}
	css (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Css, PackageExtract(pckg))
	}
	load (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Load, PackageExtract(pckg))
	}
	ajax (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Ajax, PackageExtract(pckg))
	}
	embed (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Embed, PackageExtract(pckg))
	}
	lazy (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Lazy, PackageExtract(pckg))
	}
	mask (...pckg: PackageArgument[]) {
		return this.include(ResourceType.Mask, PackageExtract(pckg))
	}

	path_getFile: Function
	path_getDir: Function
};

export declare type PackageArgument = string | string[] | { [namespace: string]: string | string[] };

function PackageExtract(pckg: any[]): PackageArgument {
	if (pckg.length > 1) return pckg;
	if (Array.isArray(pckg[0])) return pckg[0];
	return pckg;
}

// private

function process(resource) {
	var type = resource.type,
		parent = resource.parent,
		url = resource.url;

	if (document == null && type === 'css') {
		resource.state = 4;
		return resource;
	}

	
	if (CustomLoader.exists(resource)) {
		if ('js' === type || 'embed' === type) {
			ScriptStack.add(resource, resource.parent);
		}

		CustomLoader.load(resource, onXHRCompleted);
		return resource;
	}
	
	switch (type) {
		case 'js':
		case 'embed':
			ScriptStack.load(resource, parent, type === 'embed');
			break;
		case 'ajax':
		case 'load':
		case 'lazy':
		case 'mask':
			Helper.XHR(resource, onXHRCompleted);
			break;
		case 'css':
			resource.state = 4;

			var tag = document.createElement('link');
			tag.href = url;
			tag.rel = "stylesheet";
			tag.type = "text/css";
			document.body.appendChild(tag);
			break;
	}

	return resource;
}

function onXHRCompleted(resource, response) {
	if (!response) {
		console.warn('Resource can`t be loaded', resource.url);
		//- resource.readystatechanged(4);
		//- return;
	}

	switch (resource.type) {
		case 'js':
		case 'embed':
			resource.source = response;
			resource.state = 2;
			ScriptStack.touch();
			return;
		case 'load':
		case 'ajax':
			resource.exports = response;
			break;
		case 'lazy':
			LazyModule.create(resource.xpath, response);
			break;
		case 'css':
			var tag = document.createElement('style');
			tag.type = "text/css";
			tag.innerHTML = response;
			document.getElementsByTagName('head')[0].appendChild(tag);
			break;
		case 'mask':
			if (response) {
				var mask = global.mask;
				if (mask == null) {
					mask = global.require('maskjs');
				}
				mask
					.Module
					.registerModule(response, { path: resource.url })
					.done(function (module) {
						resource.exports = module.exports;
						resource.readystatechanged(4);
					})
					.fail(function (error) {
						console.error(error);
						resource.readystatechanged(4);
					});
				return;
			}
			break;
	}

	resource.readystatechanged(4);
}

function resource_getChildren(includes, type, out = []) {
	if (includes == null)
		return null;

	var imax = includes.length,
		i = -1,
		x;
	while (++i < imax) {
		x = includes[i].resource;

		if (type === x.type)
			out.push(x);

		if (x.includes != null)
			resource_getChildren(x.includes, type, out);
	}
	return out;
}
