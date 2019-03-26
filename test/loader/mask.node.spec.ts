(function () {

	global.mask = require('maskjs');
	
	let includeModule = require('../../lib/include.node.module.js');
	let include = includeModule
		.includeLib
		.instance(`file://${__filename}`);

	

	UTest({
		'loads mask' (done) {
	
		include
			.mask('../letter/letter.mask')
			.done(function(resp){
				var compo = global.mask.getHandler('Letter');
				notEq_(compo, null);
				notEq_(resp.mask.letter.Letter, null);
				done();
			});

		}
	});

}());