include.routes({
     "lib": "/.reference/libjs/{0}/lib/{1}.js",
     "framework": "/.reference/libjs/framework/lib/{0}.js",
     "compo": "/.reference/libjs/compos/{0}/lib/{1}.js"
});

include.cfg({
	loader: {
		'coffee': {
			lib: 'include/loader/coffee/loader'
		},
		'less': {
			lib: 'include/loader/less/loader'	
		}
	}
});