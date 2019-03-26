let $glob = typeof global !== 'undefined' ? global : window;
let url = $glob.include.url;
let instance = () => includeModule
	.includeLib
	.instance(url)
	.cfg('commonjs', true);

let include = instance();

UTest({		
    $after () {
        include.noConflict();        
    },
    $teardown () {
        include = $glob.include = instance();
    },
	
    'include should work with enabled modules' (done) {
        include
            .js('../letter/commonjs/a.js::Module')
            .done(resp => {
                eq_(resp.Module.a, 'a');
                done();
            });
    },
    'should load modules `a`, `b` and `c` via `b`' () {
        
        var aExports = $glob.require('../letter/commonjs/a.js');
        eq_(aExports.a, 'a');

        var bExports = $glob.require('../letter/commonjs/b.js');
        eq_(bExports.b, 'b');
        eq_(bExports.c, 'c');
    },
    'should load with node module resolver with package.json' () {
        let fooExports = $glob.require('foo_common');
        eq_(fooExports.foo, 'FooCommon');
	},
});