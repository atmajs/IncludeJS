import { path_normalize } from "./utils/path";
import { cfg } from './Config'
import { ResourceType } from "./models/Type";
import { Resource } from "./Resource";

declare var global: any;

export const Bin = {
	add (type: ResourceType, id: string, resource: Resource) {		
		bin[type][normalize(id)] = resource;
	},
	find (url: string) {
        let x = find(bin, url);
        return x && x.resource || null;
    },
	remove (url: string) {
        while (true) {
            // clear if has multiple types
            let x = find(bin, url);
            if (x == null) break;            
            bin[x.type][x.id] = null;
        }
	},
	get (type: ResourceType, url: string) {
        let x = findInType(bin, type, url);
        if (x == null) {
            x = find(bin, url);
        }
        return x && x.resource || null;	
	}
};

export const bin = {
	js: {},
	css: {},
	load: {},
	ajax: {},
	embed: {},
	mask: {}
};



export function bin_removeDelegate(url) {
    // use timeout as sys-file-change event is called twice
    var timeout;
    return function () {
        if (timeout)
            clearTimeout(timeout);

        timeout = setTimeout(function () {
            bin_tryReload(url, () => {
                cfg.autoreload && cfg.autoreload.fileChanged(url, 'include')
            });

        }, 150);
    };
};

export function bin_remove(url) {
    let x = find(bin, url);
    if (x == null)  {
        console.warn('<include:res:remove> Resource is not in cache', url);
        return null;
    } 
    let { type, id, resource } = x;
    if (global.io && global.io.File) {
        global.io.File.clearCache(resource.url);
    }
    bin[type][id] = null;  
    let roots = clearParents(bin, resource);
    return {
        resource,
        parents: roots
    };
};

export function bin_tryReload(path, callback) {
    var result = bin_remove(path);
    if (result == null) {
        callback(false);
        return;
    }
    let { resource, parents } = result;
    if (parents.length === 0) {
        callback(true);
        return;
    }
    var count = parents.length,
        imax = count,
        i = -1;

    while (++i < imax) {
        bin_load(resource, parents[i]).done(() => {
            if (--count === 0) {
                callback(true);
            }
        });
    }
}

// PRIVATE

function bin_load(resource: Resource, parent:Resource) {    
    parent.exports = null;
    return parent
        .create(
            resource.type,
            resource.route,
            resource.namespace,
            resource.xpath
        )
        .resource
        .on(4, parent.childLoaded);

}

function normalize(url) {
	let id = path_normalize(url);
	let q = id.indexOf('?');
	if (q !== -1)
		id = id.substring(0, q);

	return id.toLowerCase();
}
function find (bins, url) {
    if (url == null) {
        return null;
    }
    url = normalize(url);
    for (let type in bins) {
        let x = findInType(bins, type, url);
        if (x != null) {
            return x;
        }        
    }
    return null;
}
function findInType (bins, type, url) {
    if (url == null) {
        return null;
    }
    url = normalize(url);
    let bin = bins[type];
    for (let id in bin) {
        if (endsWith(id, url) || endsWith(url, id)) {
            let resource = bin[id];
            if (resource == null) {
                continue;
            }
            return {
                type,
                id,
                resource
            };
        }
    }
}
function endsWith (str: string, end: string) {
    let sL = str.length;
    let eL = end.length;
    return sL >= eL && str.indexOf(end) === str.length - end.length;
}
function findParents (bins, resource: Resource) {
    let arr = [];
    for (let type in bins) {
        let bin = bins[type];
        for (let id in bin) {
            let res: Resource = bin[id];
            if (res == null) {
                continue;
            }
            let children = res.includes;
            if (children == null) {
                continue;
            }
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if (child.resource.url === resource.url) {
                    arr.push({ resource: res, id, type });
                    break;
                }
            }
        }
    }
    return arr;
}
function clearParents (bins, resource: Resource, roots: Resource[] = [], handled: string[] = []) {
    if (handled.indexOf(resource.url) > -1) {
        return roots;
    }
    let parents = findParents(bins, resource);
    if (parents.length === 0) {
        roots.push(resource);
        return roots;
    }
    parents.forEach(x => {
        bins[x.type][x.id] = null;
        handled.push(x.resource.url);
        clearParents(bins, x.resource, roots, handled);
    });    
}