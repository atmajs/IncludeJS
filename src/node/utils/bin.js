function bin_removeDelegate(url) {
    // use timeout as sys-file-change event is called twice
    var timeout;
    return function() {
        if (timeout)
            clearTimeout(timeout);

        timeout = setTimeout(function() {
            
            var triggerFn;
            if (typeof cfg.autoreload === 'object') {
                triggerFn = function(state){
                    state !== false && cfg.autoreload.fileChanged(url, 'include');
                };
            }
            
            bin_tryReload(url, triggerFn);
            
        }, 150);
    };
}

function bin_remove(path) {
    if (path == null)
        return;

    var type,
        id,
        index,
        res;

    for (type in bin) {

        for (id in bin[type]) {
            res = bin[type][id];

            index = id.indexOf(path);
            if (index !== -1 && index === id.length - path.length) {

                delete bin[type][id];
                return res.parent && res.parent.url
                    ? bin_remove(res.parent.url)
                    : res
                    ;
            }
        }

    }
    console.warn('<include:res:remove> Resource is not in cache', path);
}

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

function bin_tryReload(path, callback) {
    var res = bin_remove(path);

    if (res == null) {
        callback && callback(false);
        return;
    }

    return bin_load(res)
        .done(callback);
}