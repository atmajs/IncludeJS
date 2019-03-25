(function () {

	
	let includeModule = require('../lib/include.node.module.js');
	let include = includeModule
		.includeLib
		.instance(__filename);


	UTest({

		'should load script with `use` feature' (done) {
			include
				.js(
					'use/a.js::a_res',
					'use/c.js::c',
					'use/b.js'
				)
				.done(function(resp){
					eq_(resp.b, 'ab');
					done();
				});
		}
	});

}());