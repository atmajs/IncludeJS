(function () {
//let includeModule = require('../../lib/include.node.module.js');
let include = includeTest
	.includeLib
	.instance(typeof __filename === 'undefined' ? '/test/modules/amd.test' : __filename)
	.cfg('amd', true);


UTest({
	$after () {
		include.noConflict();
	},
	'include should work with enabled amd': function (done) {
		include
			.js('../letter/amd/a.js::Module')
			.done(resp => {
				eq_(resp.Module.a, 'a');
				done();
			});
	},
	'should load modules `a`': function(done) {
		include
			.js('../letter/amd/a.js::Module')
			.done(resp => {
				eq_(resp.Module.a, 'a');
				done();
			});
			return;
		global.require(['../letter/amd/a.js'], function(aExports){
			eq_(aExports.a, 'a');
			done();
		});
	},
	'should load modules `b` and `c` via `b`': function(done) {
		global.require(['../letter/amd/b.js'], function(bExports){
			eq_(bExports.b, 'b');
			eq_(bExports.c, 'c');
			done();
		});
	},
	'should load json and text': function(done) {
		global.require(['../letter/amd/d.json', '../letter/amd/e.txt'], function(d, e){
			eq_(d.letter, 'd');
			eq_(e, 'letter: e');
			done();
		});
	},
	'should load with node module resolver with package.json': function (done) {
		global.require(['foo_amd'], function(fooExports){
			eq_(fooExports.foo, 'Foo');
			done();
		});
	},
})

}());