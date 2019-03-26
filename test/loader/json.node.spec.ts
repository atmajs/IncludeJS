(function () {
	
	let includeModule = require('../../lib/include.node.module.js');
	let include = includeModule
		.includeLib
		.instance(`file://${__filename}`);

	UTest({
		'loads json' (done) {
			include.load('../letter/letter.json').done(function(resp){
				eq_(resp.load.letter.a, 'A');
				done();
			});
		}
	})

}());