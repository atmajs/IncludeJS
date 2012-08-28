void function(){
	
	/** "Best Documentation is in simple, but full use case with comments" */

	include
		/**
		 * Loading javascript files
		 * @argument
		 * 		1. String - IncludeUrl:
		 * 			a) "folder/file.js" - relative to current included javascript file
		 * 			b) "/folder/file.js" - relative to current loaded html file
		 * 		2. [String] - IncludedUrl, @see &uarr;
		 * 		3. { route: String|[String] } - @see .cfg, if route == '' @see 1. and 2. &uarr;
		 */
		.js({
			libs: ['linq','mask'],
			'': ['/builder.js','helper.js']
		})
		
		/**
		 * Loading css files
		 *  @arguments - @see .js 
		 */
		.css({
			styles: ['main','theme/dark']
		})
		
		/**
		 *	Loading/XMLHTTPRequest-ing
		 *	@arguments - @see .js (same url handling)
		 */
		.load('/data/description.txt')
		
		/**
		 *	Ajaxing/XMLHTTPRequest-ing ;)
		 *	same as .load, but its data is not embedded in release. @see Building Project
		 *	@arguments - @see .load
		 */
		.ajax('/user/tenbits/news')
		
		/**
		 *	Loading scripts with script-tag, while .js loads first and than evals source.
		 *	This usually used to load cross-domain scripts.
		 *	(i) Nested dependencies couldnt be handled jet
		 */
		.embed('http://example.com/script.js')
		
		/**
		 *	Lazy Module
		 *	@argument {xpath: url}
		 *
		 *	url - @see .js
		 *	xpath - is object path in 'window' - use dot for nested objects,
		 *			example 'some.namespace.myobj'
		 *
		 *	Under the hood __defineGetter__ is used,
		 *	as soon as you make call to this object, the source is eval-ed,
		 *	and the last statement is applied to self.
		 *
		 *	From example below, notification.js script is not evaluated
		 *	until you call window.ui.notification.show('Hello');
		 *
		 */
		.lazy({
			'ui.notification': '/scripts/ui/notification.js'
		})
		
		/**
		 *	Fire callback fn when all upper resources and also subresources are loaded
		 */		
		.done(function() { console.log('done'); })
		
		
		/**
		 *	Same as .done, but additionally it waits (if not yet) for DOMContentLoaded
		 */
		.ready(function() { console.log('dom ready'); });
		
	/** .cfg - define routing */
	
	include
		/**
		 *	Routing is mad-simple yet - {name} will be replaced with supplied value
		 *
		 *	In case of .css({styles: 'theme/dark'}) we become 'app/styles/theme/dark.css'
		 */
		.cfg({
			libs: 'file:///c:/dev/libs/{name}/lib/{name}.js',
			styles: 'app/styles/{name}.css'
		});
		
	}
}();