
var file_read,
    file_watch;
    
(function(){
    var _fs = require('fs'),
		_watchers = {};
		
    file_read = function(url, callback){
        if (cfg.sync) {
			try {
				var content = _fs.readFileSync(url, 'utf8');
				
				callback(null, content);
			} catch(error) {
				console.error('File Read - ', error);
			}
			
			return;
		}
		_fs.readFile(url, 'utf8', callback);
    };
    
    file_watch =  function(path, callback){
        _unbind(path);
        _watchers[path] = _fs.watch(path, callback);
    };
    
    
    function _unbind(path) {
        if (_watchers[path] == null)
            return;
        
        _watchers[path].close();
        _watchers[path] = null;
    }
    
}());
	
	