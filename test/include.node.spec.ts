import { includeModule } from './lib';

declare let global;

UTest({
    $before () {
        global.include = include = includeModule
            .includeLib
            .instance();

        include.routes({
            waterfall: '/test/letter/waterfall/{0}/{1}.js',
            exports: '/test/letter/exports/{0}.js',
            condition: '/test/letter/condition/{0}.js',
        });
    },

    'Waterfall' (done) {
        global.letters = {};

        include.js({
            waterfall: 'a'
        }).done(function() {
            deepEq_(letters, {
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
            }, 'Response from a.js is not "a"');

            deepEq(resp.B, {
                b: 'b',
                c: 'c'
            }, 'Response from b.js is wrong');

            done();
        });
    },
    'Condition' (done){
        include.js({
            condition: 'a?letter=b::Letter'
        }).done(function(resp){

            assert(resp.Letter == 'b', 'Condition load failed');

            done();
        })
    },

    'Empty' (done){
        include.instance().done(() => {

            var self = include.instance();

                self
                    .client()
                    .js('WОNT/LOAD')
                    .done(() => {
                        deepEq_(self.includes, []);
                        done();
                    });
        });


    }
})
