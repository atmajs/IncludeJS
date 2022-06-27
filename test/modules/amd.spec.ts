import { includeLib } from '../lib'

let $glob: any = typeof global !== 'undefined' ? global : window;
let url = $glob.include.url;

let instance = () => includeLib
    .instance(url)
    .cfg('amd', true);

let include = instance();

UTest({
    $after () {
        include.noConflict();
    },
    $teardown () {
        include = $glob.include = instance();
    },
    'include should work with enabled amd' (done) {
        include
            .js('../letter/amd/a.js::Module')
            .done(resp => {
                eq_(resp.Module.a, 'a');
                done();
            });
    },
    'should load modules `a`'(done) {
        include
            .js('../letter/amd/a.js::Module')
            .done(resp => {
                eq_(resp.Module.a, 'a');
                done();
            });
    },
    'should load modules `b` and `c` via `b`'(done) {
        $glob.require(['../letter/amd/b.js'], function(bExports){
            eq_(bExports.b, 'b');
            eq_(bExports.c, 'c');
            done();
        });
    },
    'should load json and text'(done) {
        $glob.require(['../letter/amd/d.json', '../letter/amd/e.txt'], function(d, e){
            eq_(d.letter, 'd');
            eq_(e, 'letter: e');
            done();
        });
    },

});
