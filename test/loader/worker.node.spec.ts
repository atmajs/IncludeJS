

let includeModule = require('../../lib/include.node.module.js');
let include = includeModule
    .includeLib
    .instance(`file://${__filename}`);

UTest({
    'loads json' (done) {
        include.js('../fixtures/foo.worker.ts::Foo').done(async (resp) => {
            let result = await resp.Foo.add(2, 3);
            done(result, 5);
        });
    }
})

export {};
