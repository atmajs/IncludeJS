(function () {
	let include = includeTest
		.includeLib
		.instance(typeof __filename === 'undefined' ? '/test/modules/commonjs.test' : __filename)
		.cfg('commonjs', true)
		;


	UTest({		
		$after () {
			console.log('AFTER');
			include.noConflict();
		},
		'include should work with enabled modules': function (done) {
			include
				.js('../letter/commonjs/a.js::Module')
				.done(resp => {
					eq_(resp.Module.a, 'a');
					done();
				});
		},
		'should load modules `a`, `b` and `c` via `b`': function() {
			
			var aExports = global.require('../letter/commonjs/a.js');
			eq_(aExports.a, 'a');

			var bExports = global.require('../letter/commonjs/b.js');
			eq_(bExports.b, 'b');
			eq_(bExports.c, 'c');
		}
	})
}());