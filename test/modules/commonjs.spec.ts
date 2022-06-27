import { includeLib } from '../lib';

declare let global;


let $global = typeof global !== 'undefined' ? global : window;
let $include;

let instance = () => {
    return includeLib
        .instance('/test/modules/commonjs.spec.ts')
        .cfg('commonjs', true);
};


UTest({
    $before () {
        $include = $global.include = instance();
    },
    $after () {
        $include.noConflict();
    },
    $teardown () {
        $include = $global.include = instance();
    },

    '//include should work with enabled modules' (done) {
        $include
            .js('../letter/commonjs/a.js::Module')
            .done(resp => {
                eq_(resp.Module.a, 'a');
                done();
            });
    },

    'should load modules `a`, `b` and `c` via `b`' () {
        var aExports = $global.require('../letter/commonjs/a.js');

        eq_(aExports.a, 'a');

        var bExports = $global.require('../letter/commonjs/b.js');
        eq_(bExports.b, 'b');
        eq_(bExports.c, 'c');
    },
    'should load with node module resolver with package.json' () {
        debugger;
        let fooExports = $global.require('foo_common');
        eq_(fooExports.foo, 'FooCommon');
    },

});
