/**
 *  Dev Machine Depended Routes. Change only Routes Config. Usually, this loader must not be included in commits.
 *
 *  ** This and other Starter Templates, are from npm globals folder. You can adapt them for your needs **
 *  
 *  This Script loads ClassJS and IncludeJS and the script that is in tags attribute main
 *      <script href='include.loader.js' main='script/main.js' />
 */
(function() {

    var routes = {
        lib: 'file:///c:/Development/libjs/{name}/lib/{name}.js',
        framework: 'file:///c:/Development/libjs/framework/lib/{name}.js',
		compo: 'file:///c:/Development/libjs/compos/{name}/lib/{name}.js'
    };


    var Loader = (function(R) {
        var load, main, ondone;
            
        if (typeof BUILDER_LOAD === 'function'){
            load = BUILDER_LOAD;
            main = 'MAIN';
        }else{
			var head = null, 
				scripts = scripts = document && document.getElementsByTagName('script') || null;
				
			load = function(url, callback) {
                var script = document.createElement('script');
                script.type = 'application/javascript';
                script.src = url;
                script.onload = callback;
                (head || (head = document.getElementsByTagName('head')[0])).appendChild(script);
            };            
            main = scripts[scripts.length - 1].getAttribute('main');
			
			ondone = function(){
				include.cfg(R);
				load(main)				
			}
		}
        
        function loadInclude() {
            load(R.lib.replace(/\{name\}/g, 'include'), ondone);
        };   

        return function() {
            load(R.lib.replace(/\{name\}/g, 'class'), loadInclude);
        }
    })(routes);


    Loader();
    

    return routes;
})();