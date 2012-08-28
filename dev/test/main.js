include.cfg({
	letter: '/{name}.js',
	compos: '../compos/{name}/lib/{name}.js'
}); 


include
	.css('/style.css')
	.js({ letter: 'a' })
	.embed('/embedded.js')
	.load('/data.json')
	.lazy({
		'lazy.obj': '/lazy.js'
	}).done(function(response) {
		console.log('MAIN.LOADED', response);
	});
