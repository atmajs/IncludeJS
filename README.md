#### IncludeJS

_The Resource Loader for Browsers and NodeJS_ with `AMD` and `CommonJS` support.

[![Build Status](https://travis-ci.org/atmajs/IncludeJS.svg?branch=master)](https://travis-ci.org/atmajs/IncludeJS)
[![NPM version](https://badge.fury.io/js/includejs.svg)](http://badge.fury.io/js/includejs)
[![Bower version](https://badge.fury.io/bo/includejs.svg)](http://badge.fury.io/bo/includejs)

Features:

- Loads any content: scripts, styles, ajax
- Development friendly: incremental builds are not required
- **ES6 Imports**    
- Production: Build the application into single html, js and css @see the [app-bundler](https://github.com/atmajs/app-bundler)
- Inline Dependency Declaration
	
	_No external files, such as package.json or config.js_
	
- Load any javascript
- No prerequests for module declaration. But supports also `CommonJS` and `include.exports`

- Namespaced routing
	```javascript
	include
		.routes({ controller: '/src/controllers/{0}.js' }); 
		//... 
	include
		.js({controller: 'user' });
	```
- Parameterized include
	```javascript
	// foo.js
	include.js({ compo: 'baz?color=green' });
	
	// baz.js
	document.body.style.backgroundColor = include.iparams.color
	```
	
- Javascript Aliases
	```javascript
	include.js('myScript.js::Logger').done(function(response){
		response.Logger.logMe();
	});	
	```
	
- Custom Loader Support

- Lazy Modules

	_Scripts will be evaluated only when you needs them_
	

- Pause resource loading

	```javascript
	// pause current module
	var resume = include.pause();
	
	someAsyncJob(function(){
		// resume with exports example
		resume({ baz: 'quux' });
	})
	```

----
:copyright: 2014 Atma.js Project


