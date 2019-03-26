let url = global.include.url;
let instance = () => includeModule
	.includeLib
	.instance(url)
	.cfg('amd', true);

let include = instance();

UTest({		
    $after () {
        include.noConflict();        
    },
    $teardown () {
        include = global.include = instance();
    },
	
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
