import { includeLib } from './lib';

let include = includeLib.instance();

UTest({
    $after () {
        include.noConflict();
    },
    'should load script with `use` feature' (done) {
        include
            .js(
                '/test/use/a.js::a_res',
                '/test/use/c.js::c',
                '/test/use/b.js'
            )
            .done(function(resp){
                eq_(resp.b, 'ab');
                done();
            });
    }
});
