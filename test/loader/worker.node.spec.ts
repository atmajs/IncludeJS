

//let includeModule = require('../../lib/include.node.module.js');
import * as includeModule from '../../src/export'


let include = includeModule
    .includeLib
    .instance(`file://${__filename}`);

UTest({
    async 'loads json' () {
        let resp = await include.js('../fixtures/foo.worker.ts::Foo')
        let result = await resp.Foo.FooWorker.add(2, 3);
        eq_(result, 5);
    }
})

export {};
