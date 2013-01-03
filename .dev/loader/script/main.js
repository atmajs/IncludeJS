console.log('inMain');
include.js({
	lib: 'compo',
	'': '/script/test.coffee'
}).css('/style/view.less').done(function(){
	window.testLog('Privet');

	//new Compo('#layout').render().insert(document.body);
	
});