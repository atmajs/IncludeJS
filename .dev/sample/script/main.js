
window.letters = {};

include.js({
	lib: 'compo',
	framework: 'dom/zepto'
}).js('/script/letter/a/a.js').ready(function(){
	
	new Compo('#layout').render().insert(document.body);
	
});