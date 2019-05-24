let global = window;
let include = includeModule
    .include
    .instance('/test/include.dom.test');

include.routes({
    waterfall: '/test/letter/waterfall/{0}/{1}.js',
    exports: '/test/letter/exports/{0}.js',
    condition: '/test/letter/condition/{0}.js',
});

UTest({
   
    'Waterfall' (done) {

        global.letters = {};

        include.js({
            waterfall: 'a'
        }).done(function() {
            deepEq(letters, {
                A: {
                    loaded: true,
                    a: {
                        loaded: true
                    }
                },
                B: {
                    loaded: true,
                    b: {
                        loaded: true
                    }
                },
                C: {
                    loaded: true,
                    c: {
                        loaded: true
                    }
                }
            }, "Waterfall failed");
            done();
        });
    },
    'Exports' (done) {
        include.js({
            exports: ['a::A', 'b::B']
        }).done(function(resp) {
            deepEq(resp.A, {
                a: 'a'
            }, 'Response from a.js::A is not "a" |');

            deepEq(resp.B, {
                b: 'b',
                c: 'c'
            }, 'Response from b.js is wrong');

            done();
        });
    },
    'Condition' (done) {
        include.instance().js({
            condition: 'a?letter=b::Letter'
        }).done(function(resp) {
            deepEq(resp, {
                Letter: 'b'
            }, 'Condition load failed');

            done();
        })
    }
})
