import { path_combine, path_getDir, path_isRelative } from "./utils/path";
import { cfg } from './Config'
import { isBrowser } from './global'
import { global } from './global'
import { ResourceType } from "./models/Type";
import { Resource } from "./Resource";




export const Bin = {
	add (type: ResourceType, id_: string, resource: Resource) {
		const id = normalizeId(id_);
		bin[type][id] = resource;
	},
	find (url: string) {
		var id = path_isRelative(url)
			? '/' + url
			: url;
		for (var type_ in bin) {
			var x = Bin.get(type_ as ResourceType, id);
			if (x != null) {
				return x;
			}
		}
		return null;
	},
	remove (url: string) {
		var resource = Bin.find(url);
		if (resource == null) {
			return;
		}
		for (var type_ in bin) {
			clear(bin[type_], resource)
		}
		function clear(hash, x) {
			for (var key in hash) {
				if (hash[key] === x) {
					hash[key] = null;
				}
			}
		}
	},
	get (type: ResourceType, id_: string) {
		if (id_ == null) {
			return;
		}
		if (type == null) {
			return Bin.find(id_);
		}
		var id = normalizeId(id_);
		var x = bin[type][id];
		if (x == null && /^https?:\//.test(id) && typeof location !== 'undefined') {
			id = id.replace(location.origin, '');
			x = bin[type][id];
		}
		if (x == null && cfg.lockedToFolder) {
			let path = /^file:/.test(id)
				? path_getDir(location.href)
				: path_getDir(location.pathname);
			var sub = path_combine('/', id.replace(path.toLowerCase(), ''));
			x = bin[type][sub];
		}
		if (x == null && isBrowser && id[0] === '/') {
			let path = path_combine(global.location.origin, id);
			x = bin[type][path];
		}
		return x;
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

            let triggerFn;
            if (cfg.autoreload != null) {
                triggerFn = function (state) {
                    state !== false && cfg.autoreload.fileChanged(url, 'include');
                };
            }

            bin_tryReload(url, triggerFn);

        }, 150);
    };
};

export function bin_remove(path) {
    if (path == null)
        return;

    var type,
        id,
        index,
        res,
        parents = []
        ;

    for (type in bin) {

        for (id in bin[type]) {
            res = bin[type][id];

            index = id.indexOf(path);
            if (index !== -1 && index === id.length - path.length) {

                bin_clearCache(type, id);

                var arr = res.parent && res.parent.url
                    ? bin_remove(res.parent.url)
                    : [res]
                    ;
                parents
                    .push
                    .apply(parents, arr);
            }
        }

    }

    if (parents.length === 0) {
        console.warn('<include:res:remove> Resource is not in cache', path);
    }

    return parents;
};

export function bin_tryReload(path, callback) {
    var parents = bin_remove(path).filter(function (x) { return x != null; });
    if (parents.length === 0) {
        callback && callback(false);
        return;
    }

    var count = parents.length,
        imax = count,
        i = -1;

    while (++i < imax) {
        bin_load(parents[i])
            .done(function () {

                if (--count === 0 && callback)
                    callback();
            });
    }
}

// PRIVATE

function bin_load(resource) {
    if (resource == null)
        return;

    resource.content = null;
    resource.exports = null;

    var parent = resource.parent;
    return parent
        .create(
            resource.type,
            resource.route,
            resource.namespace,
            resource.xpath
        )
        .on(4, parent.childLoaded);

}

function bin_clearCache(type, id) {
    var resource = bin[type][id],
        children = resource.includes
        ;
    delete bin[type][id];

    if (children == null)
        return;

    children.forEach(function (child) {
        var resource = child.resource,
            type = resource.type,
            id = resource.url
            ;

        if (id[0] !== '/')
            id = '/' + id;

        delete bin[type][id];
    });
}




function normalizeId(id_) {
	var id = id_;
	var q = id.indexOf('?');
	if (q !== -1)
		id = id.substring(0, q);

	return id.toLowerCase();
}