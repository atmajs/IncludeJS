/**
 *  Dev Machine Depended Routes. Usually, this loader must not be included in commits.
 *	{This File is also used in [include.builder]/[projects.template]/starter/include.loder.js}
 *
 *  ** This and other Starter Templates, are from npm globals folder. You can adapt them to your needs **
 *  
 *  This Script loads ClassJS and IncludeJS and the script that is in tags attribute main
 *      <script href='include.loader.js' main='script/main.js' />
 *
 */
(function() {

	/** Here are project- and dev- dependent routes, see {npm/includejs/globals.json} */
    var routes = %ROUTES%;
	
	/** Dont touch nothing below */

    var Loader = (function(R) {
        var load, main, ondone;
            
        if (typeof BUILDER_LOAD === 'function'){
            load = BUILDER_LOAD;
            main = 'MAIN';
        }else{
			var head = null, 
				scripts = scripts = document && document.getElementsByTagName('script') || null;
				
			load = function(url, callback) {
                if (url[0] == '/')  url = url.substring(1);
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