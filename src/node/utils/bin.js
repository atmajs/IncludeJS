var bin_removeDelegate,
    bin_remove,
    bin_tryReload
    ;

(function(){
        
    bin_removeDelegate = function(url) {
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
    };
    
    bin_remove = function(path) {
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
                        : [ res ]
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
    
    bin_tryReload = function(path, callback) {
        var parents = bin_remove(path).filter(function(x){ return x != null; });
        if (parents.length === 0) {
            callback && callback(false);
            return;
        }
        
        var count = parents.length,
            imax = count,
            i = -1;
        
        while (++i < imax) {
            bin_load(parents[i])
                .done(function(){
                    
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
    
    function bin_clearCache(type, id){
        var resource = bin[type][id],
            children = resource.includes
            ;
        delete bin[type][id];
        
        if (children == null) 
            return;
        
        children.forEach(function(child){
            var resource = child.resource,
                type = resource.type,
                id = resource.url
                ;
                
            if (id[0] !== '/') 
                id = '/' + id;
                
            delete bin[type][id];
        });
    }
    
}());
